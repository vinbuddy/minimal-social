import { prop, getModelForClass, modelOptions, Severity, Ref, index } from "@typegoose/typegoose";
import mongoose from "mongoose";

import { User } from "../users/user.model";
import type { Reel } from "./reel.model";

/**
 * The sound of a reel. Every reel with an audio track creates its "original audio";
 * other reels can reuse it, and the audio page lists every reel that uses it.
 */
@modelOptions({ schemaOptions: { collection: "audios", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
@index({ owner: 1 })
export class Audio {
    @prop({ auto: true })
    public _id?: mongoose.Types.ObjectId;

    // null means "Original audio", translated on the client
    @prop({ default: null })
    public title: string | null;

    @prop({ ref: () => User, required: true })
    public owner: Ref<User>;

    @prop({ ref: "Reel", default: null })
    public sourceReel: Ref<Reel> | null;

    // Cloudinary video public id the sound comes from
    @prop({ required: true })
    public sourcePublicId: string;

    // MP3 preview of the sound
    @prop({ required: true })
    public url: string;

    @prop({ required: true })
    public coverUrl: string;

    // Seconds
    @prop({ required: true })
    public duration: number;

    @prop({ default: 0 })
    public reelCount: number;
}

const AudioModel = getModelForClass(Audio);
export default AudioModel;
