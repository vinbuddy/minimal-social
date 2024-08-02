import { prop, getModelForClass, Ref, modelOptions, Severity } from "@typegoose/typegoose";
import { User } from "./user.model";
import mongoose from "mongoose";
import { Conversation } from "./conversation.model";
import { MediaFile } from "./post.model";

export class MessageReaction {
    @prop({ required: true, ref: () => User })
    public user: Ref<User>;

    @prop({ required: true })
    public reaction: string;
}

@modelOptions({ schemaOptions: { collection: "messages", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
export class Message {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    @prop({ required: true, ref: () => User })
    sender: Ref<User>;

    @prop({ required: true, ref: () => Conversation })
    conversation: Ref<Conversation>;

    @prop({ default: null })
    content: string;

    @prop({ default: [] })
    public mediaFiles: MediaFile[];

    @prop({ ref: () => User, default: null })
    public replyTo: Ref<User>;

    @prop({ default: [] })
    public reaction: MessageReaction[];

    @prop({ default: false })
    public isEdited?: boolean;

    @prop({ default: false })
    public isRetracted: boolean;

    @prop({ default: [] })
    public seenBy: Ref<User>[];
}
const MessageModel = getModelForClass(Message);
export default MessageModel;
