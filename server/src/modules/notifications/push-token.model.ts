import { getModelForClass, index, prop, Ref } from "@typegoose/typegoose";
import { User } from "../users/user.model";

/** An Expo push token of a signed-in mobile device; a user has one per device */
@index({ user: 1 })
export class PushToken {
    @prop({ ref: () => User, required: true })
    public user!: Ref<User>;

    /** ExponentPushToken[...]; unique, so a phone that changes accounts moves to the new user */
    @prop({ required: true, unique: true })
    public token!: string;

    @prop({ required: true, enum: ["ios", "android"] })
    public platform!: "ios" | "android";
}

export const PushTokenModel = getModelForClass(PushToken, {
    schemaOptions: { collection: "push_tokens", timestamps: true },
});
