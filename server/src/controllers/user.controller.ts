import { NextFunction, Request, Response } from "express";
import UserModel from "../models/user.model";

export async function getUsersHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserModel.find().select("-password -refreshToken");

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

        const user = await UserModel.findById(id).select("-password -refreshToken");

        return res.status(200).json({ statusCode: 200, data: user });
    } catch (error) {
        next(error);
    }
}
