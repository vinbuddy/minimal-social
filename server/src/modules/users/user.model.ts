import { prop, getModelForClass, modelOptions, Severity, Ref, pre, index } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const USER_MODEL_HIDDEN_FIELDS: string = "-password -refreshToken";

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

@pre<User>("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    // Already hashed (e.g. copied from a pending OTP registration)
    if (BCRYPT_HASH_REGEX.test(this.password)) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;

    return;
})
@modelOptions({ schemaOptions: { collection: "users", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
@index({ username: 1 })
export class User {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    @prop({ required: true })
    public username: string;

    @prop({ required: true, unique: true })
    public email: string;

    @prop({ required: false, default: null })
    public password: string;

    @prop({
        default:
            "https://res.cloudinary.com/dtbhvc4p4/image/upload/v1720978549/profile/344060599-e8733bc3-ac77-42c6-b036-b9f1fb31b21c_hlh6by.png",
    })
    public photo: string;

    @prop({ default: null })
    public photoPublicId: string;

    @prop({ required: true, default: false })
    public isAdmin?: boolean;

    @prop({ required: true, default: "I am a new user" })
    public bio: string;

    @prop({ default: null })
    public googleId?: string;

    @prop({ default: false })
    public isNotification: boolean;

    @prop({ required: true, default: false })
    isVerified: boolean;

    @prop({ required: false, default: null })
    refreshToken: string | null;
}

const UserModel = getModelForClass(User);
export default UserModel;
