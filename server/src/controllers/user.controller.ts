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
