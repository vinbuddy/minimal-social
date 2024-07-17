import { prop, getModelForClass, modelOptions, Ref, Severity } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { User } from "./user.model";

export class NotificationReceiver {
    @prop({ ref: () => User, required: true })
    public receiver: Ref<User>;

    @prop({ default: false })
    public isRead: boolean;
}

@modelOptions({
    schemaOptions: { collection: "notifications", timestamps: true },
    options: { allowMixed: Severity.ALLOW },
})
export class Notification {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    @prop({ required: true })
    public targetType: "Comment" | "Post" | "User";

    @prop({ required: true, enum: ["like", "comment", "follow", "mention", "repost"] })
    public action: "like" | "comment" | "follow" | "mention" | "repost";

    @prop({ required: true })
    public photo: string;

    @prop({ required: true })
    public message: string;

    @prop({ default: null })
    public url: string | null;

    @prop({ ref: () => User, required: true })
    public sender: Ref<User>;

    @prop({ ref: () => NotificationReceiver, required: true })
    public receivers: Ref<NotificationReceiver>[];
}

const NotificationModel = getModelForClass(Notification);
export default NotificationModel;
