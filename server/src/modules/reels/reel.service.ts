import crypto from "crypto";
import mongoose, { PipelineStage } from "mongoose";

import cloudinary from "../../shared/configs/cloudinary";
import envConfig from "../../shared/configs/env";
import logger from "../../shared/configs/logger";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/app-error";
import { moderateMediaFiles } from "../../shared/helpers/media-moderation";
import { extractMentionsAndTags, replaceHrefs } from "../../shared/helpers/text-parser";
import CommentModel from "../comments/comment.model";
import { getBlockedUserIds } from "../posts/post.service";
import UserModel from "../users/user.model";
import AudioModel from "./audio.model";
import { ReelLikeModel, ReelViewModel, SavedAudioModel } from "./reel-interaction.model";
import ReelModel from "./reel.model";
import { CreateReelInput } from "./reel.schema";

const { ObjectId } = mongoose.Types;

type Id = string | mongoose.Types.ObjectId;

interface Viewer {
    _id: Id;
    isAdmin?: boolean;
}

export const REEL_FOLDER = "reels";
export const REEL_MAX_DURATION = 90; // seconds
export const REEL_MAX_BYTES = 100 * 1024 * 1024;

// 720p is plenty for a phone-sized player; q_auto/vc_auto let Cloudinary pick bitrate and codec
const PLAYBACK_TRANSFORMATION = "c_limit,h_1280,w_720/q_auto,vc_auto";
const THUMBNAIL_TRANSFORMATION = "so_0/c_limit,h_1280,w_720/q_auto";

const SAFE_USER_FIELDS = { _id: 1, username: 1, photo: 1, isVerified: 1 };

/* ---------------------------------- Cloudinary URLs ---------------------------------- */

/** Overlay layers reference public ids with ":" instead of "/" */
const toLayerId = (publicId: string) => publicId.replace(/\//g, ":");

type AudioSource = { sourcePublicId: string } | null;

function playbackTransformation(audio: AudioSource) {
    // Reusing another reel's sound: drop this video's own track, then lay the sound over it
    if (!audio) return PLAYBACK_TRANSFORMATION;

    return `${PLAYBACK_TRANSFORMATION}/ac_none/l_audio:${toLayerId(audio.sourcePublicId)}/fl_layer_apply`;
}

function buildPlaybackUrl(publicId: string, audio: AudioSource) {
    return cloudinary.url(publicId, {
        resource_type: "video",
        secure: true,
        raw_transformation: playbackTransformation(audio),
        format: "mp4",
    });
}

function buildThumbnailUrl(publicId: string) {
    return cloudinary.url(publicId, {
        resource_type: "video",
        secure: true,
        raw_transformation: THUMBNAIL_TRANSFORMATION,
        format: "jpg",
    });
}

function buildAudioUrl(publicId: string) {
    return cloudinary.url(publicId, { resource_type: "video", secure: true, raw_transformation: "br_128k", format: "mp3" });
}

/* ---------------------------------- Aggregation stages ---------------------------------- */

/** Author, audio and the viewer's like/follow state: everything a reel card needs */
function reelCardStages(viewerId: Id): PipelineStage.FacetPipelineStage[] {
    const viewer = new ObjectId(viewerId);

    return [
        {
            $lookup: {
                from: "users",
                let: { userId: "$reelBy" },
                pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } } }, { $project: SAFE_USER_FIELDS }],
                as: "reelBy",
            },
        },
        { $unwind: "$reelBy" },
        {
            $lookup: {
                from: "audios",
                let: { audioId: "$audio" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$audioId"] } } },
                    {
                        $lookup: {
                            from: "users",
                            let: { ownerId: "$owner" },
                            pipeline: [
                                { $match: { $expr: { $eq: ["$_id", "$$ownerId"] } } },
                                { $project: SAFE_USER_FIELDS },
                            ],
                            as: "owner",
                        },
                    },
                    { $unwind: "$owner" },
                ],
                as: "audio",
            },
        },
        { $addFields: { audio: { $ifNull: [{ $arrayElemAt: ["$audio", 0] }, null] } } },
        {
            $lookup: {
                from: "reellikes",
                let: { reelId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ["$reel", "$$reelId"] }, { $eq: ["$user", viewer] }] } } },
                    { $limit: 1 },
                ],
                as: "viewerLike",
            },
        },
        {
            $lookup: {
                from: "follows",
                let: { authorId: "$reelBy._id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $and: [{ $eq: ["$follower", viewer] }, { $eq: ["$following", "$$authorId"] }] },
                        },
                    },
                    { $limit: 1 },
                ],
                as: "viewerFollow",
            },
        },
        {
            $addFields: {
                isLiked: { $gt: [{ $size: "$viewerLike" }, 0] },
                isFollowing: { $gt: [{ $size: "$viewerFollow" }, 0] },
            },
        },
        { $project: { viewerLike: 0, viewerFollow: 0, __v: 0 } },
    ];
}

async function paginateReels(
    match: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    viewerId: Id,
    page: number,
    limit: number
) {
    const [result] = await ReelModel.aggregate([
        { $match: match },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $sort: sort }, { $skip: (page - 1) * limit }, { $limit: limit }, ...reelCardStages(viewerId)],
            },
        },
    ]);

    const totalReels: number = result.metadata[0]?.total || 0;

    return { reels: result.data, totalReels, totalPages: Math.ceil(totalReels / limit) };
}

/** Reels the viewer may see: their own unless rejected, and approved ones from anyone outside a block in either direction */
async function visibleReelsMatch(viewerId: Id) {
    const blockedUserIds = await getBlockedUserIds(viewerId);

    return {
        $or: [
            { reelBy: new ObjectId(viewerId), moderationStatus: { $ne: "rejected" } },
            { reelBy: { $nin: blockedUserIds }, moderationStatus: "approved" },
        ],
    };
}

function toObjectIds(ids: string[]) {
    return ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new ObjectId(id));
}

async function getReelOrThrow(reelId: Id) {
    if (!mongoose.isValidObjectId(reelId)) throw new NotFoundError("Reel not found");

    const reel = await ReelModel.findById(reelId);
    if (!reel) throw new NotFoundError("Reel not found");

    return reel;
}

async function getAudioOrThrow(audioId: Id) {
    if (!mongoose.isValidObjectId(audioId)) throw new NotFoundError("Audio not found");

    const audio = await AudioModel.findById(audioId);
    if (!audio) throw new NotFoundError("Audio not found");

    return audio;
}

/* ---------------------------------- Upload & create ---------------------------------- */

/**
 * Signs a direct browser → Cloudinary upload, so large videos never pass through this server.
 * The public id is fixed in the signature and carries the author's id, which createReel checks.
 */
export function createUploadSignature(authorId: Id) {
    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `${REEL_FOLDER}/${authorId}_${crypto.randomBytes(8).toString("hex")}`;
    const signature = cloudinary.utils.api_sign_request(
        { public_id: publicId, timestamp },
        envConfig.CLOUDINARY_API_SECRET
    );

    return {
        publicId,
        timestamp,
        signature,
        apiKey: envConfig.CLOUDINARY_API_KEY,
        cloudName: envConfig.CLOUDINARY_CLOUD_NAME,
        maxDuration: REEL_MAX_DURATION,
        maxBytes: REEL_MAX_BYTES,
    };
}

/** Reads the uploaded video's metadata and starts generating the playback rendition in the background */
async function inspectUploadedVideo(publicId: string, transformation: string) {
    try {
        await cloudinary.uploader.explicit(publicId, {
            type: "upload",
            resource_type: "video",
            eager: [{ raw_transformation: transformation, format: "mp4" }],
            eager_async: true,
        });

        // explicit() returns no media info; the Admin API does (duration, has_audio)
        const resource = await cloudinary.api.resource(publicId, { resource_type: "video", media_metadata: true });

        return {
            width: Number(resource.width) || 0,
            height: Number(resource.height) || 0,
            bytes: Number(resource.bytes) || 0,
            duration: Number(resource.duration) || 0,
            hasAudio: Boolean(resource.has_audio),
        };
    } catch (error) {
        logger.error("Failed to inspect uploaded reel video", { publicId, error });
        throw new BadRequestError("Video not found, please upload it again");
    }
}

async function parseCaption(rawCaption: string) {
    const { mentions: mentionUsernames, tags } = extractMentionsAndTags(rawCaption);
    const caption = await replaceHrefs(rawCaption);
    const mentionedUsers = await UserModel.find({ username: { $in: mentionUsernames } }).select("_id");

    return { caption, mentions: mentionedUsers.map((user) => user._id), tags };
}

export async function createReel(authorId: Id, { publicId, caption: rawCaption, audioId }: CreateReelInput) {
    if (!publicId.startsWith(`${REEL_FOLDER}/${authorId}_`)) {
        throw new ForbiddenError("This video was not uploaded by you");
    }

    if (await ReelModel.exists({ "video.publicId": publicId })) {
        throw new BadRequestError("This video is already published");
    }

    const reusedAudio = audioId ? await getAudioOrThrow(audioId) : null;
    const resource = await inspectUploadedVideo(publicId, playbackTransformation(reusedAudio));
    const { duration } = resource;

    if (duration > REEL_MAX_DURATION + 0.5 || resource.bytes > REEL_MAX_BYTES) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video", invalidate: true });
        throw new BadRequestError(`Reels must be at most ${REEL_MAX_DURATION} seconds and 100MB`);
    }

    const { caption, mentions, tags } = await parseCaption(rawCaption);
    const thumbnailUrl = buildThumbnailUrl(publicId);

    const reel = await ReelModel.create({
        reelBy: new ObjectId(authorId),
        caption,
        mentions,
        tags,
        audio: reusedAudio?._id ?? null,
        video: {
            publicId,
            url: buildPlaybackUrl(publicId, reusedAudio),
            thumbnailUrl,
            width: resource.width,
            height: resource.height,
            duration,
        },
    });

    if (reusedAudio) {
        await AudioModel.updateOne({ _id: reusedAudio._id }, { $inc: { reelCount: 1 } });
    } else if (resource.hasAudio) {
        // The video has its own sound: it becomes an "original audio" others can reuse
        const author = await UserModel.findById(authorId).select("photo");
        const audio = await AudioModel.create({
            owner: new ObjectId(authorId),
            sourceReel: reel._id,
            sourcePublicId: publicId,
            url: buildAudioUrl(publicId),
            coverUrl: author?.photo ?? thumbnailUrl,
            duration,
            reelCount: 1,
        });

        reel.audio = audio._id;
        await reel.save();
    }

    // Moderate in a background queue instead of blocking the request
    const { imageModerationQueue } = await import("../../shared/queues/image-moderation.queue");
    await imageModerationQueue.add("moderate-reel", { reelId: reel._id.toString() });

    return getReelDetail(authorId, reel._id);
}

/**
 * Checks frames of a pending reel's video. A safe reel is approved; an unsafe one is removed
 * entirely (file, audio, likes, comments). Returns null when there was nothing to moderate.
 */
export async function moderateReel(reelId: Id) {
    const reel = await ReelModel.findById(reelId);
    if (!reel || reel.moderationStatus !== "pending") return null;

    const reelBy = reel.reelBy!.toString();
    const isSafe = await moderateMediaFiles([{ publicId: reel.video.publicId, url: reel.video.url, type: "video" }]);

    if (isSafe) {
        await ReelModel.updateOne({ _id: reel._id }, { moderationStatus: "approved" });
        return { status: "approved" as const, reelBy };
    }

    await removeReel(reel);
    return { status: "rejected" as const, reelBy };
}

/* ---------------------------------- Reads ---------------------------------- */

/**
 * Reels tab feed ranked with the same gravity idea as the post feed, plus views.
 * `excludeIds` lets the client skip reels it already shows (the opened reel, earlier pages).
 */
export async function getFeed(viewerId: Id, page: number, limit: number, excludeIds: string[] = []) {
    const match = await visibleReelsMatch(viewerId);

    const [result] = await ReelModel.aggregate([
        { $match: { ...match, _id: { $nin: toObjectIds(excludeIds) } } },
        { $sort: { createdAt: -1 } },
        { $limit: 500 }, // Optimization: only score the 500 latest reels
        {
            $addFields: {
                // Score = (likes*2 + comments*3 + views*0.1 + 1) / (ageInHours + 2)^1.5
                score: {
                    $divide: [
                        {
                            $add: [
                                { $multiply: ["$likeCount", 2] },
                                { $multiply: ["$commentCount", 3] },
                                { $multiply: ["$viewCount", 0.1] },
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
                    { $sort: { score: -1, _id: -1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                    ...reelCardStages(viewerId),
                ],
            },
        },
    ]);

    const totalReels: number = result.metadata[0]?.total || 0;

    return { reels: result.data, totalReels, totalPages: Math.ceil(totalReels / limit) };
}

export async function getReelDetail(viewerId: Id, reelId: Id) {
    if (!mongoose.isValidObjectId(reelId)) throw new NotFoundError("Reel not found");

    const match = await visibleReelsMatch(viewerId);
    const [reel] = await ReelModel.aggregate([
        { $match: { ...match, _id: new ObjectId(reelId) } },
        ...reelCardStages(viewerId),
    ]);

    if (!reel) throw new NotFoundError("Reel not found");

    return reel;
}

export async function getUserReels(viewerId: Id, userId: string, page: number, limit: number) {
    if (!mongoose.isValidObjectId(userId)) throw new NotFoundError("User not found");

    const match = await visibleReelsMatch(viewerId);

    return paginateReels(
        { ...match, reelBy: new ObjectId(userId) },
        { createdAt: -1 },
        viewerId,
        page,
        limit
    );
}

/** Reels using one sound, most watched first: the "related reels" of the audio page */
export async function getAudioReels(viewerId: Id, audioId: string, page: number, limit: number) {
    const audio = await getAudioOrThrow(audioId);
    const match = await visibleReelsMatch(viewerId);

    return paginateReels({ ...match, audio: audio._id }, { viewCount: -1, _id: -1 }, viewerId, page, limit);
}

export async function getAudioDetail(viewerId: Id, audioId: string) {
    const audio = await getAudioOrThrow(audioId);

    const [owner, isSaved] = await Promise.all([
        UserModel.findById(audio.owner).select(Object.keys(SAFE_USER_FIELDS).join(" ")),
        SavedAudioModel.exists({ audio: audio._id, user: viewerId }),
    ]);

    return { ...audio.toObject(), owner, isSaved: isSaved !== null };
}

export async function getSavedAudios(viewerId: Id, page: number, limit: number) {
    const query = { user: new ObjectId(viewerId) };

    const [saved, totalAudios] = await Promise.all([
        SavedAudioModel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({ path: "audio", populate: { path: "owner", select: Object.keys(SAFE_USER_FIELDS).join(" ") } }),
        SavedAudioModel.countDocuments(query),
    ]);

    return {
        // A saved audio whose source was deleted populates to null
        audios: saved.map((item) => item.audio).filter(Boolean),
        totalAudios,
        totalPages: Math.ceil(totalAudios / limit),
    };
}

/* ---------------------------------- Interactions ---------------------------------- */

function isDuplicateKeyError(error: unknown) {
    return (error as { code?: number })?.code === 11000;
}

export async function likeReel(viewerId: Id, reelId: Id) {
    const reel = await getReelOrThrow(reelId);

    try {
        await ReelLikeModel.create({ reel: reel._id, user: viewerId });
    } catch (error) {
        if (isDuplicateKeyError(error)) return { likeCount: reel.likeCount };
        throw error;
    }

    const updated = await ReelModel.findByIdAndUpdate(reel._id, { $inc: { likeCount: 1 } }, { new: true });

    return { likeCount: updated?.likeCount ?? reel.likeCount + 1 };
}

export async function unlikeReel(viewerId: Id, reelId: Id) {
    const reel = await getReelOrThrow(reelId);
    const { deletedCount } = await ReelLikeModel.deleteOne({ reel: reel._id, user: viewerId });

    if (!deletedCount) return { likeCount: reel.likeCount };

    const updated = await ReelModel.findByIdAndUpdate(reel._id, { $inc: { likeCount: -1 } }, { new: true });

    return { likeCount: Math.max(updated?.likeCount ?? 0, 0) };
}

/** Counts a view once per user per reel */
export async function viewReel(viewerId: Id, reelId: Id) {
    const reel = await getReelOrThrow(reelId);

    const result = await ReelViewModel.updateOne(
        { reel: reel._id, user: new ObjectId(viewerId) },
        { $setOnInsert: { reel: reel._id, user: new ObjectId(viewerId) } },
        { upsert: true }
    );

    if (result.upsertedCount > 0) {
        await ReelModel.updateOne({ _id: reel._id }, { $inc: { viewCount: 1 } });
    }
}

export async function saveAudio(viewerId: Id, audioId: string) {
    const audio = await getAudioOrThrow(audioId);

    await SavedAudioModel.updateOne(
        { audio: audio._id, user: new ObjectId(viewerId) },
        { $setOnInsert: { audio: audio._id, user: new ObjectId(viewerId) } },
        { upsert: true }
    );
}

export async function unsaveAudio(viewerId: Id, audioId: string) {
    const audio = await getAudioOrThrow(audioId);

    await SavedAudioModel.deleteOne({ audio: audio._id, user: viewerId });
}

/** Keeps the reel's comment counter in step with comment creates and deletes */
export async function incrementCommentCount(reelId: Id, amount: number) {
    await ReelModel.updateOne({ _id: reelId }, { $inc: { commentCount: amount } });
}

/* ---------------------------------- Delete ---------------------------------- */

export async function deleteReel(viewer: Viewer, reelId: Id) {
    const reel = await getReelOrThrow(reelId);

    if (String(reel.reelBy) !== viewer._id.toString() && !viewer.isAdmin) {
        throw new ForbiddenError("You are not allowed to delete this reel");
    }

    await removeReel(reel);
}

/** Deletes a reel with everything hanging off it, keeping its video file while other reels use its sound */
async function removeReel(reel: Awaited<ReturnType<typeof getReelOrThrow>>) {
    const audio = reel.audio ? await AudioModel.findById(reel.audio) : null;
    const isOwnOriginalAudio = audio?.sourceReel?.toString() === reel._id.toString();
    // Other reels lay this video's sound over theirs, so the file has to stay while they exist
    const isSoundInUse = isOwnOriginalAudio && (audio?.reelCount ?? 0) > 1;

    if (audio && isOwnOriginalAudio && !isSoundInUse) {
        await Promise.all([AudioModel.deleteOne({ _id: audio._id }), SavedAudioModel.deleteMany({ audio: audio._id })]);
    } else if (audio) {
        await AudioModel.updateOne(
            { _id: audio._id },
            { $inc: { reelCount: -1 }, ...(isOwnOriginalAudio ? { sourceReel: null } : {}) }
        );
    }

    if (!isSoundInUse) {
        await cloudinary.uploader.destroy(reel.video.publicId, { resource_type: "video", invalidate: true });
    }

    await Promise.all([
        ReelModel.deleteOne({ _id: reel._id }),
        CommentModel.deleteMany({ target: reel._id }),
        ReelLikeModel.deleteMany({ reel: reel._id }),
        ReelViewModel.deleteMany({ reel: reel._id }),
    ]);
}
