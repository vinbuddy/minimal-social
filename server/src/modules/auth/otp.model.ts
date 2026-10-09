import { Severity, getModelForClass, modelOptions, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

export const OTP_MAX_ATTEMPTS = 5;

@pre<OTP>("save", async function () {
    if (this.isModified("otp")) {
        this.otp = await bcrypt.hash(this.otp, 10);
    }

    // Never keep the pending user's password in plaintext; UserModel skips re-hashing bcrypt hashes
    if (this.isModified("password") && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
})
@modelOptions({ schemaOptions: { collection: "otps", timestamps: true }, options: { allowMixed: Severity.ALLOW } })
class OTP {
    @prop({ required: false, default: "" })
    public username: string;

    @prop({ required: true, unique: true })
    public email: string;

    @prop({ required: false, default: "" })
    public password: string;

    @prop({ required: true })
    otp: string;

    @prop({ required: false, default: "register" })
    type: "register" | "forgot" | "change";

    @prop({ default: 0 })
    attempts: number;

    @prop({ default: Date.now, expires: process.env.OTP_EXPIRATION ?? "5m" })
    createdAt: Date;
}

export const OTPModel = getModelForClass(OTP);
