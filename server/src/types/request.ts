import { Request } from "express";
import { User } from "../models/user.model";

export interface RequestWithUser extends Request {
    user: User;
}

export interface RequestWithFiles extends Request {
    files: Express.Multer.File[];
}
