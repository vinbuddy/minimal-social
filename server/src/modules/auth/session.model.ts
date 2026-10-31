import { getModelForClass, index, prop, Ref } from "@typegoose/typegoose";
import { User } from "../users/user.model";

export type SessionClient = "web" | "mobile";

/**
 * One row per signed-in device. Only the refresh token's jti is stored: a refresh token is valid
 * while its session exists, so web and mobile (or several phones) stay signed in side by side.
 */
@index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // Drop sessions once their refresh token has expired
export class Session {
    @prop({ ref: () => User, required: true, index: true })
    public user!: Ref<User>;

    @prop({ required: true, unique: true })
    public jti!: string;

    @prop({ required: true, enum: ["web", "mobile"], default: "web" })
    public client!: SessionClient;

    @prop({ required: true })
    public expiresAt!: Date;
}

export const SessionModel = getModelForClass(Session, {
    schemaOptions: { collection: "auth_sessions", timestamps: true },
});
