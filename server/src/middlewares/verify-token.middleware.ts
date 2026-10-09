import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../modules/users/user.model";
import envConfig from "../shared/configs/env";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies["accessToken"];

    if (!accessToken) {
        return res.status(403).json({ message: "No access token provided" });
    }

    try {
        const user = jwt.verify(accessToken, envConfig.JWT_ACCESS_KEY) as User;
        req.user = user;
        next();
    } catch (error: any) {
        if (error?.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
};

export const verifyAdminToken = (req: Request, res: Response, next: NextFunction) => {
    verifyToken(req, res, () => {
        const user = req.user as User;

        if (!user) return res.status(403).json({ message: "Unauthorized" });

        if (user?.isAdmin) {
            next();
        } else {
            return res.status(403).json({ message: "You are not allowed" });
        }
    });
};
