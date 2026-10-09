import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import envConfig from "../configs/env";
import { User } from "../../modules/users/user.model";

const generateToken = (user: User, type: "access" | "refresh" = "access"): string => {
    const key = type == "access" ? envConfig.JWT_ACCESS_KEY : envConfig.JWT_REFRESH_KEY;

    return jwt.sign(
        {
            _id: user._id,
            isAdmin: user.isAdmin,
        },
        key,
        {
            expiresIn: type == "access" ? envConfig.JWT_ACCESS_EXPIRATION : envConfig.JWT_REFRESH_EXPIRATION,
            // Unique per token: without it, two tokens issued in the same second are identical,
            // so a rotated-out refresh token would still match the stored one
            jwtid: randomUUID(),
        }
    );
};

export { generateToken };
