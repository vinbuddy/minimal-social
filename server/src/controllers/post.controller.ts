import { NextFunction, Request, Response } from "express";
import PostModel, { MediaFile } from "../models/post.model";
import { extractMentionsAndTags, replaceHrefs } from "../helpers/textParser";
import UserModel from "../models/user.model";
import mongoose from "mongoose";
import { createPostInput, createPostSchema } from "../schemas/post.schema";
import { uploadToCloudinary } from "../helpers/cloudinary";

interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}

export async function createPost(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFiles;
        const { postBy, caption } = createPostSchema.parse(req.body) as createPostInput;

        const files = req.files as Express.Multer.File[];

        let uploadedFiles: MediaFile[] = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                let uploadPromise = uploadToCloudinary(file, "posts");
                return uploadPromise;
            });
            uploadedFiles = await Promise.all(uploadPromises);
        }

        const { mentions: mentionUsernames, tags } = extractMentionsAndTags(caption);

        const formatCaption = await replaceHrefs(caption);

        const mentionUserIds: any = [];
        const userInMentions = await UserModel.find({
            username: { $in: mentionUsernames },
        });
        userInMentions.forEach((user) => {
            const userId = new mongoose.Types.ObjectId(user._id);
            mentionUserIds.push(userId);
        });

        const newPost = await PostModel.create({
            postBy: new mongoose.Types.ObjectId(postBy),
            caption: formatCaption,
            mentions: mentionUserIds,
            tags,
            mediaFiles: (uploadedFiles as MediaFile[]) ?? [],
        });

        await newPost.save();

        const post = await PostModel.populate(newPost, [{ path: "postBy" }, { path: "mentions" }]);

        return res.status(200).json({ message: "Create post successfully", data: post });
    } catch (error) {
        next(error);
    }
}
