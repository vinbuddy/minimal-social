import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
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
                return res.status(403).json({ message: "Invalid token" });
            }

            console.log("user: ", user);
            next();
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
