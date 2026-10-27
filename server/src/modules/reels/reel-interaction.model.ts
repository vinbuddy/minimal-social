import { getModelForClass, prop, index, Ref } from "@typegoose/typegoose";
import { User } from "../users/user.model";
import { Reel } from "./reel.model";
import { Audio } from "./audio.model";

@index({ reel: 1, user: 1 }, { unique: true }) // A user can only like a reel once
export class ReelLike {
    @prop({ ref: () => Reel, required: true })
    public reel!: Ref<Reel>;

    @prop({ ref: () => User, required: true })
    public user!: Ref<User>;
}

@index({ reel: 1, user: 1 }, { unique: true }) // One view per user per reel
export class ReelView {
    @prop({ ref: () => Reel, required: true })
    public reel!: Ref<Reel>;

    @prop({ ref: () => User, required: true })
    public user!: Ref<User>;
}

@index({ user: 1, createdAt: -1 })
@index({ audio: 1, user: 1 }, { unique: true })
export class SavedAudio {
    @prop({ ref: () => Audio, required: true })
    public audio!: Ref<Audio>;

    @prop({ ref: () => User, required: true })
    public user!: Ref<User>;
}

export const ReelLikeModel = getModelForClass(ReelLike, { schemaOptions: { timestamps: true } });
export const ReelViewModel = getModelForClass(ReelView, { schemaOptions: { timestamps: true } });
export const SavedAudioModel = getModelForClass(SavedAudio, { schemaOptions: { timestamps: true } });
