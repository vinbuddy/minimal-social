import { prop, getModelForClass, modelOptions, Severity, Ref, index } from "@typegoose/typegoose";
import mongoose from "mongoose";

import { User } from "../users/user.model";
import { Audio } from "./audio.model";

export class ReelVideo {
    @prop({ required: true })
    public publicId: string;

    // Optimized MP4 for playback (with the audio track swapped in when the reel uses another audio)
    @prop({ required: true })
    public url: string;

    @prop({ required: true })
    public thumbnailUrl: string;

    @prop({ required: true })
    public width: number;

    @prop({ required: true })
    public height: number;

    // Seconds
    @prop({ required: true })
    public duration: number;
}

@modelOptions({ schemaOptions: { collection: "reels", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
@index({ reelBy: 1, createdAt: -1 })
@index({ audio: 1, createdAt: -1 })
@index({ "video.publicId": 1 }, { unique: true })
export class Reel {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    @prop({ required: true, type: () => ReelVideo, _id: false })
    public video: ReelVideo;

    @prop({ default: "" })
    public caption: string;

    @prop({ ref: () => User, required: true })
    public reelBy: Ref<User>;

    @prop({ ref: () => User, default: [] })
    public mentions: Ref<User>[];

    @prop({ default: [] })
    public tags: string[];

    @prop({ ref: () => Audio, default: null })
    public audio: Ref<Audio> | null;

    // Denormalized counters: the feed ranks on them, so they are kept on the document instead of counted per request
    @prop({ default: 0 })
    public likeCount: number;

    @prop({ default: 0 })
    public commentCount: number;

    @prop({ default: 0 })
    public viewCount: number;

    // Pending until the video frames pass moderation; only the author sees a pending reel
    @prop({ default: "pending", enum: ["pending", "approved", "rejected"] })
    public moderationStatus?: string;
}

const ReelModel = getModelForClass(Reel);
export default ReelModel;
