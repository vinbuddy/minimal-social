import { NextFunction, Request, Response } from "express";
import UserModel, { USER_MODEL_HIDDEN_FIELDS } from "../models/user.model";
import { FollowUserInput, followUserSchema } from "../schemas/user.schema";
import cloudinary from "../configs/cloudinary";

import { uploadToCloudinary } from "../helpers/cloudinary";
import { MediaFile } from "../models/post.model";

interface RequestWithFile extends Request {
    file: Express.Multer.File;
}

export async function getUsersHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserModel.find().select(USER_MODEL_HIDDEN_FIELDS);

        return res.status(200).json({ statusCode: 200, data: users });
    } catch (error) {
        next(error);
    }
}

export async function getUserHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ statusCode: 400, message: "Id is required" });
        }

        const user = await UserModel.findById(id).select(USER_MODEL_HIDDEN_FIELDS);

        return res.status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        next(error);
    }
}

export async function searchUserHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const query = req.query.query as string;

        const users = await UserModel.find({
            $or: [{ username: { $regex: query, $options: "i" } }],
        }).select(USER_MODEL_HIDDEN_FIELDS);

        return res.status(200).json({ statusCode: 200, data: users });
    } catch (error) {
        next(error);
    }
}

export async function followUserHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, currentUserId } = followUserSchema.parse(req.body) as FollowUserInput;

        if (currentUserId === userId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const userToFollow = await UserModel.findById(userId);
        const currentUser = await UserModel.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.followings.includes(userToFollow._id)) {
            return res.status(400).json({ message: "Already following this user" });
        }

        currentUser.followings.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();

        return res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        next(error);
    }
}

export async function unfollowUserHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, currentUserId } = followUserSchema.parse(req.body) as FollowUserInput;

        if (currentUserId === userId) {
            return res.status(400).json({ message: "You cannot unfollow yourself" });
        }

        const userToFollow = await UserModel.findById(userId);
        const currentUser = await UserModel.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.followings.includes(userToFollow._id)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        await UserModel.findByIdAndUpdate(currentUserId, { $pull: { followings: userId } });
        await UserModel.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });

        return res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getFollowSuggestionsHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.query.userId as string;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 15;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const skip = (Number(page) - 1) * limit;
        const totalUsers = await UserModel.countDocuments({
            _id: { $ne: userId }, // Except yourself
            followers: { $ne: userId }, // Except users followed you
            followings: { $ne: userId }, // Except users that you followed
        });
        const totalPages = Math.ceil(totalUsers / limit);

        const suggestions = await UserModel.find({
            _id: { $ne: userId }, // Except yourself
            followers: { $ne: userId }, // Except users followed you
            followings: { $ne: userId }, // Except users that you followed
        })
            .skip(skip)
            .limit(limit)
            .select(USER_MODEL_HIDDEN_FIELDS);

        return res.status(200).json({ statusCode: 200, data: suggestions, totalPages, totalUsers, page, limit });
    } catch (error) {
        next(error);
    }
}

export async function editProfileHandler(_req: Request, res: Response, next: NextFunction) {
    try {
        const req = _req as RequestWithFile;
        const userId = req.params.id;
        const { bio, username } = req.body;

        if (!userId) {
            return res.status(400).json({ statusCode: 400, message: "Id is required" });
        }

        let mediaFile: MediaFile | null = null;

        if (req.file) {
            mediaFile = await uploadToCloudinary(req.file, "avatar");
        }

        const updateValue: any = {};

        if (mediaFile) {
            updateValue["photo"] = mediaFile.url;
            updateValue["photoPublicId"] = mediaFile.publicId;
        }

        if (username) {
            updateValue["username"] = req.body.username;
        }

        if (bio) {
            updateValue["bio"] = bio;
        }

        if (Object.keys(updateValue).length === 0) {
            return res.status(400).json({ message: "You must change something to edit your profile" });
        }

        const user = await UserModel.findById(userId);

        // Delete old photo from cloudinary
        if (mediaFile && user && user.photoPublicId) {
            await cloudinary.uploader.destroy(user.photoPublicId);
        }

        const updated = await UserModel.findByIdAndUpdate(userId, updateValue);

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedUser = await UserModel.findById(userId).select(USER_MODEL_HIDDEN_FIELDS);

        return res.status(200).json({ message: "Profile updated successfully", data: updatedUser });
    } catch (error) {
        next(error);
    }
}
