import jwt from "jsonwebtoken";

import dotenv from "dotenv";
import { User } from "../models/user.model";

dotenv.config();

const generateToken = (user: User, type: "access" | "refresh" = "access"): string => {
    const key = process.env.JWT_ACCESS_KEY as string;

    const accessToken = jwt.sign(
        {
            _id: user._id,
            isAdmin: user.isAdmin,
        },
        key,
        {
            expiresIn: type == "access" ? process.env.JWT_ACCESS_EXPIRATION : process.env.JWT_REFRESH_EXPIRATION,
        }
    );

    return accessToken;
};

export { generateToken };
