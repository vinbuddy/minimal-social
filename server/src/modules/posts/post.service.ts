import mongoose, { PipelineStage } from "mongoose";
import cloudinary from "../../shared/configs/cloudinary";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error";
import { uploadToCloudinary } from "../../shared/helpers/cloudinary";
import { extractMentionsAndTags, replaceHrefs } from "../../shared/helpers/text-parser";
import CommentModel from "../comments/comment.model";
import { BlockModel } from "../users/block.model";
import { FollowModel } from "../users/follow.model";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../users/user.model";
import { PostLikeModel } from "./post-like.model";
import PostModel, { MediaFile } from "./post.model";

const { ObjectId } = mongoose.Types;

type Id = string | mongoose.Types.ObjectId;

interface Viewer {
    _id: Id;
    isAdmin?: boolean;
}

const POST_POPULATE = [
    { path: "postBy", select: USER_MODEL_HIDDEN_FIELDS },
    { path: "mentions", select: USER_MODEL_HIDDEN_FIELDS },
];

const SAFE_USER_PROJECTION: PipelineStage.Project = { $project: { password: 0, refreshToken: 0, __v: 0 } };

/**
 * Like/comment/repost counts plus whether the viewer liked/reposted the post.
 * Only small projections are looked up, never whole documents.
 */
function postStatsStages(viewerId: Id): PipelineStage[] {
    const viewer = new ObjectId(viewerId);

    return [
        {
            $lookup: {
                from: "comments",
                let: { postId: "$_id" },
                pipeline: [{ $match: { $expr: { $eq: ["$target", "$$postId"] } } }, { $count: "count" }],
                as: "commentStats",
            },
        },
        {
            $lookup: {
                from: "postlikes",
                let: { postId: "$_id" },
                pipeline: [{ $match: { $expr: { $eq: ["$post", "$$postId"] } } }, { $project: { _id: 0, user: 1 } }],
                as: "likes",
            },
        },
        {
            $lookup: {
                from: "posts",
                let: { postId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$originalPost", "$$postId"] } } },
                    { $project: { _id: 0, postBy: 1 } },
                ],
                as: "reposts",
            },
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                repostCount: { $size: "$reposts" },
                commentCount: { $ifNull: [{ $arrayElemAt: ["$commentStats.count", 0] }, 0] },
                isLiked: { $in: [viewer, "$likes.user"] },
                isReposted: { $in: [viewer, "$reposts.postBy"] },
            },
        },
        { $project: { likes: 0, reposts: 0, commentStats: 0 } },
    ];
}

/** Author and mentioned users, without sensitive fields */
function postAuthorStages(): PipelineStage[] {
    return [
        {
            $lookup: {
                from: "users",
                let: { userId: "$postBy" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, SAFE_USER_PROJECTION],
                as: "postBy",
            },
        },
        { $unwind: "$postBy" },
        {
            $lookup: {
                from: "users",
                let: { userIds: { $ifNull: ["$mentions", []] } },
                pipeline: [{ $match: { $expr: { $in: ["$_id", "$$userIds"] } } }, SAFE_USER_PROJECTION],
                as: "mentions",
            },
        },
    ];
}

/**
 * The reposted post with its own author/stats. The nested pipeline only runs when there is an
 * original post (a plain lookup on `originalPost._id` would match every non-repost post when it is null).
 */
function originalPostStages(viewerId: Id): PipelineStage[] {
    return [
        {
            $lookup: {
                from: "posts",
                let: { originalPostId: "$originalPost" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$originalPostId"] } } },
                    ...(postStatsStages(viewerId) as PipelineStage.Lookup["$lookup"]["pipeline"] & {}),
                    ...(postAuthorStages() as PipelineStage.Lookup["$lookup"]["pipeline"] & {}),
                ],
                as: "originalPost",
            },
        },
        { $addFields: { originalPost: { $ifNull: [{ $arrayElemAt: ["$originalPost", 0] }, null] } } },
    ];
}

/** Everything a post card needs, for a viewer */
function fullPostStages(viewerId: Id): PipelineStage[] {
    return [...postStatsStages(viewerId), ...postAuthorStages(), ...originalPostStages(viewerId)];
}

async function paginatePosts(match: Record<string, unknown>, viewerId: Id, page: number, limit: number) {
    const [result] = await PostModel.aggregate([
        { $match: match },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    ...(fullPostStages(viewerId) as PipelineStage.FacetPipelineStage[]),
                ],
            },
        },
    ]);

    const totalPosts: number = result.metadata[0]?.total || 0;

    return { posts: result.data, totalPosts, totalPages: Math.ceil(totalPosts / limit) };
}

/** Users the viewer blocked plus users who blocked the viewer */
async function getBlockedUserIds(userId: Id) {
    const blocks = await BlockModel.find({ $or: [{ blocker: userId }, { blocked: userId }] }).select("blocker blocked");

    return blocks.map((block) => (block.blocker.toString() === userId.toString() ? block.blocked : block.blocker));
}

/** Turn @mentions into user links and collect mentioned user ids and #tags */
async function parseCaption(caption: string) {
    const { mentions: mentionUsernames, tags } = extractMentionsAndTags(caption);
    const formattedCaption = await replaceHrefs(caption);

    const mentionedUsers = await UserModel.find({ username: { $in: mentionUsernames } }).select("_id");

    return { caption: formattedCaption, mentions: mentionedUsers.map((user) => user._id), tags };
}

async function getPostOrThrow(postId: Id) {
    if (!mongoose.isValidObjectId(postId)) throw new NotFoundError("Post not found");

    const post = await PostModel.findById(postId);
    if (!post) throw new NotFoundError("Post not found");

    return post;
}

function assertCanModify(post: { postBy: unknown }, viewer: Viewer) {
    if (String(post.postBy) !== viewer._id.toString() && !viewer.isAdmin) {
        throw new ForbiddenError("You are not allowed to modify this post");
    }
}

export async function createPost(authorId: Id, rawCaption: string, files: Express.Multer.File[] = []) {
    const uploadedFiles: MediaFile[] = await Promise.all(files.map((file) => uploadToCloudinary(file, "posts")));
    const { caption, mentions, tags } = await parseCaption(rawCaption);

    const newPost = await PostModel.create({
        postBy: new ObjectId(authorId),
        caption,
        mentions,
        tags,
        mediaFiles: uploadedFiles,
        // Posts with images wait for moderation; text-only posts are approved right away
        moderationStatus: uploadedFiles.length > 0 ? "pending" : "approved",
    });

    if (uploadedFiles.length > 0) {
        // Moderate in a background queue instead of blocking the request
        const { imageModerationQueue } = await import("../../shared/queues/image-moderation.queue");
        await imageModerationQueue.add("moderate-images", { postId: newPost._id, mediaFiles: uploadedFiles });
    }

    return PostModel.populate(newPost, POST_POPULATE);
}

export async function editPost(viewer: Viewer, postId: Id, rawCaption: string) {
    const post = await getPostOrThrow(postId);
    assertCanModify(post, viewer);

    const { caption, mentions, tags } = await parseCaption(rawCaption);

    const updatedPost = await PostModel.findByIdAndUpdate(
        post._id,
        { caption, mentions, tags, isEdited: true },
        { new: true }
    );

    return PostModel.populate(updatedPost!, POST_POPULATE);
}

export async function deletePost(viewer: Viewer, postId: Id) {
    const post = await getPostOrThrow(postId);
    assertCanModify(post, viewer);

    if (post.mediaFiles?.length) {
        await Promise.all(post.mediaFiles.map((file) => cloudinary.uploader.destroy(file.publicId)));
    }

    await Promise.all([
        PostModel.findByIdAndDelete(post._id),
        CommentModel.deleteMany({ target: post._id }),
        PostLikeModel.deleteMany({ post: post._id }),
    ]);
}

/** Home feed ranked with a HackerNews-style gravity score, excluding blocked users in both directions */
export async function getFeed(viewerId: Id, page: number, limit: number) {
    const blockedUserIds = await getBlockedUserIds(viewerId);

    const [result] = await PostModel.aggregate([
        {
            $match: {
                moderationStatus: { $ne: "rejected" },
                $or: [
                    { postBy: new ObjectId(viewerId) }, // Include my posts
                    { postBy: { $nin: blockedUserIds } },
                ],
            },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 1000 }, // Optimization: only score the 1000 latest posts
        ...postStatsStages(viewerId),
        {
            $addFields: {
                // Score = (likes*2 + comments*3 + reposts*1.5 + 1) / (ageInHours + 2)^1.5
                score: {
                    $divide: [
                        {
                            $add: [
                                { $multiply: ["$likeCount", 2] },
                                { $multiply: ["$commentCount", 3] },
                                { $multiply: ["$repostCount", 1.5] },
                                1,
                            ],
                        },
                        {
                            $pow: [{ $add: [{ $divide: [{ $subtract: ["$$NOW", "$createdAt"] }, 3600000] }, 2] }, 1.5],
                        },
                    ],
                },
            },
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { score: -1, createdAt: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    ...(postAuthorStages() as PipelineStage.FacetPipelineStage[]),
                    ...(originalPostStages(viewerId) as PipelineStage.FacetPipelineStage[]),
                ],
            },
        },
    ]);

    const totalPosts: number = result.metadata[0]?.total || 0;

    return { posts: result.data, totalPosts, totalPages: Math.ceil(totalPosts / limit) };
}

export async function getFollowingPosts(viewerId: Id, page: number, limit: number) {
    const following = await FollowModel.find({ follower: viewerId }).select("following");

    return paginatePosts(
        { postBy: { $in: following.map((f) => f.following) }, moderationStatus: { $ne: "rejected" } },
        viewerId,
        page,
        limit
    );
}

export async function getLikedPosts(viewerId: Id, page: number, limit: number) {
    const [likes, blockedUserIds] = await Promise.all([
        PostLikeModel.find({ user: viewerId }).select("post"),
        getBlockedUserIds(viewerId),
    ]);

    return paginatePosts(
        { _id: { $in: likes.map((like) => like.post) }, postBy: { $nin: blockedUserIds } },
        viewerId,
        page,
        limit
    );
}

export async function getUserPosts(viewerId: Id, userId: string, type: "post" | "repost", page: number, limit: number) {
    if (!mongoose.isValidObjectId(userId) || !(await UserModel.exists({ _id: userId }))) {
        throw new NotFoundError("User not found");
    }

    const match: Record<string, unknown> = { postBy: new ObjectId(userId) };
    if (type === "repost") match.originalPost = { $ne: null };

    return paginatePosts(match, viewerId, page, limit);
}

export async function getPostDetail(viewerId: Id, postId: string) {
    if (!mongoose.isValidObjectId(postId)) throw new NotFoundError("Post not found");

    const [post] = await PostModel.aggregate([{ $match: { _id: new ObjectId(postId) } }, ...fullPostStages(viewerId)]);
    if (!post) throw new NotFoundError("Post not found");

    return post;
}

export async function searchPosts(viewerId: Id, query: string, page: number, limit: number) {
    return paginatePosts({ $text: { $search: query.trim() } }, viewerId, page, limit);
}

export async function likePost(viewerId: Id, postId: Id) {
    const post = await getPostOrThrow(postId);

    const existingLike = await PostLikeModel.exists({ post: post._id, user: viewerId });
    if (existingLike) throw new BadRequestError("Post already liked");

    await PostLikeModel.create({ post: post._id, user: viewerId });

    return PostModel.populate(post, POST_POPULATE);
}

export async function unlikePost(viewerId: Id, postId: Id) {
    const post = await getPostOrThrow(postId);

    const { deletedCount } = await PostLikeModel.deleteOne({ post: post._id, user: viewerId });
    if (deletedCount === 0) throw new BadRequestError("You have not liked this post");

    return PostModel.populate(post, POST_POPULATE);
}

export async function repost(viewerId: Id, postId: Id) {
    const post = await getPostOrThrow(postId);

    // Reposting a repost reposts the original
    const originalPostId = post.originalPost ?? post._id;

    const alreadyReposted = await PostModel.exists({ postBy: viewerId, originalPost: originalPostId });
    if (alreadyReposted) throw new BadRequestError("Post already reposted");

    const repostedPost = await PostModel.create({ postBy: new ObjectId(viewerId), originalPost: originalPostId });

    return PostModel.populate(repostedPost, POST_POPULATE);
}

/** Remove the viewer's repost of a post (`postId` may be the original post or a repost of it) */
export async function unrepost(viewerId: Id, postId: Id) {
    const post = await getPostOrThrow(postId);
    const originalPostId = post.originalPost ?? post._id;

    const deleted = await PostModel.findOneAndDelete({ postBy: viewerId, originalPost: originalPostId });
    if (!deleted) throw new NotFoundError("You have not reposted this post");
}

export async function getUsersLikedPost(postId: Id, page: number, limit: number) {
    const post = await getPostOrThrow(postId);
    const condition = { post: post._id };

    const totalUsers = await PostLikeModel.countDocuments(condition);
    const likes = await PostLikeModel.find(condition)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "user", select: USER_MODEL_HIDDEN_FIELDS });

    return { users: likes.map((like) => like.user).filter(Boolean), totalUsers, totalPages: Math.ceil(totalUsers / limit) };
}

export async function getUsersRepostedPost(postId: Id, page: number, limit: number) {
    const post = await getPostOrThrow(postId);
    const condition = { originalPost: post._id };

    const totalUsers = await PostModel.countDocuments(condition);
    const reposts = await PostModel.find(condition)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({ path: "postBy", select: USER_MODEL_HIDDEN_FIELDS });

    return { users: reposts.map((repost) => repost.postBy).filter(Boolean), totalUsers, totalPages: Math.ceil(totalUsers / limit) };
}
