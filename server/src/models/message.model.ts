import { prop, getModelForClass, Ref, modelOptions, Severity } from "@typegoose/typegoose";
import { User } from "./user.model";
import mongoose from "mongoose";
import { Conversation } from "./conversation.model";
import { MediaFile } from "./post.model";

export class MessageReaction {
    @prop({ required: true, ref: () => User })
    public user: Ref<User>;

    @prop({ required: true })
    public emoji: string;
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

    @prop({ ref: () => Message, default: null })
    public replyTo: Ref<Message>;

    @prop({ default: [] })
    public reactions: MessageReaction[];

    @prop({ default: false })
    public isEdited?: boolean;

    @prop({ default: false })
    public isRetracted: boolean;

    @prop({ default: [] })
    public seenBy: Ref<User>[];

    @prop({ default: Date.now })
    public createdAt?: Date;
}
const MessageModel = getModelForClass(Message);
export default MessageModel;
