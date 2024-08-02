import { prop, getModelForClass, Ref, modelOptions, Severity } from "@typegoose/typegoose";
import { User } from "./user.model";
import mongoose from "mongoose";

// class ConversationParticipant {
//     @prop({ required: true, ref: () => User })
//     public user: Ref<User>;

//     @prop({ default: null })
//     public nickname: string;
// }

class GroupInfo {
    @prop({ required: true })
    public name: string;

    @prop({ default: null })
    public photo: string;
}

class LastMessage {
    @prop({ required: true, ref: () => User })
    public sender: Ref<User>;

    @prop({ required: true })
    public content: string;

    @prop({ default: Date.now })
    public createdAt: Date;
}

@modelOptions({
    schemaOptions: { collection: "conversations", timestamps: true },
    options: { allowMixed: Severity.ALLOW },
})
export class Conversation {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    @prop({ required: true, ref: () => User })
    public participants: Ref<User>[];

    @prop({ default: false })
    public isGroup: boolean;

    @prop({ default: null })
    public groupInfo: GroupInfo;

    @prop({ default: null })
    public lastMessage: LastMessage;

    @prop({ default: null })
    public theme: string;

    @prop({ default: null })
    public emoji: string;
}

const ConversationModel = getModelForClass(Conversation);
export default ConversationModel;
