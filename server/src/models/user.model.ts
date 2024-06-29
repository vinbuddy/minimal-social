import { prop, getModelForClass, modelOptions, Severity, Ref, pre } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

@pre<User>("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;

    return;
})
@modelOptions({ schemaOptions: { collection: "users", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
export class User {
    @prop({ auto: true })
    public _id?: mongoose.Schema.Types.ObjectId;

    @prop({ required: true })
    public username: string;

    @prop({ required: true, unique: true })
    public email: string;

    @prop({ required: true })
    public password: string;

    @prop({
        default: "https://github.com/vinbuddy/mimimal-social/assets/94288269/e8733bc3-ac77-42c6-b036-b9f1fb31b21c",
    })
    public photo: string;

    @prop({ required: true, default: false })
    public isAdmin?: boolean;

    @prop({ ref: () => User })
    public friendRequests: Ref<User>[];

    @prop({ ref: () => User })
    public friends: Ref<User>[];

    @prop({ required: true, default: "I am a new user" })
    public bio: string;

    @prop({ required: true, default: false })
    isVerified: boolean;
}

const UserModel = getModelForClass(User);
export default UserModel;
