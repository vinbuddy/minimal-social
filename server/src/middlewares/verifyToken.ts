import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";
import { Types } from "mongoose";
import { error } from "console";

dotenv.config();

interface CustomRequest extends Request {
    user?: User;
}

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    const accessToken = token && token.split(" ")[1];

    if (!accessToken) {
        return res.status(401).json({ message: "No access token provided" });
    }

    try {
        const accessKey = process.env.JWT_ACCESS_KEY as string;
        jwt.verify(accessToken, accessKey, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token", error: err.message });
            }

            console.log("user: ", user);
            req.user = user as User;
            next();
        });
    } catch (error) {
        console.log("error: ", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

export const verifyAdminToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    verifyToken(req, res, () => {
        if (!req.user) return res.status(403).json({ message: "Unauthorized" });

        if (req.user.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
