import bcrypt from "bcrypt";
import otpGenerator from "otp-generator";
import envConfig from "../../shared/configs/env";
import { AppError, BadRequestError } from "../../shared/errors/app-error";
import { sendEmail } from "../../shared/helpers/email-sender";
import { OTPModel, OTP_MAX_ATTEMPTS } from "./otp.model";

export type OTPType = "register" | "forgot" | "change";

const OTP_EMAIL_SUBJECTS: Record<OTPType, string> = {
    register: "OTP for Minimal Social",
    forgot: "OTP for resetting password",
    change: "OTP for changing password",
};

interface IssueOTPInput {
    email: string;
    type: OTPType;
    /** Pending data stored with the OTP until it is verified (password is hashed by the model) */
    username?: string;
    password?: string;
}

/**
 * Generate an OTP, email it and store it (hashed). Any pending OTP for the same email is replaced.
 */
export async function issueOTP({ email, type, username, password }: IssueOTPInput) {
    // `email` is unique in the otps collection, so only one pending OTP per email can exist
    await OTPModel.deleteMany({ email });

    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });

    const isSent = await sendEmail(
        envConfig.EMAIL_APP_USER,
        email,
        OTP_EMAIL_SUBJECTS[type],
        `Your OTP is ${otp}. This OTP will expire in 5 minutes.`
    );

    if (!isSent) {
        throw new AppError("Could not send OTP email, please try again later", 502);
    }

    await OTPModel.create({ email, type, otp, username, password });
}

/**
 * Check an OTP and count failed attempts. After OTP_MAX_ATTEMPTS wrong guesses the OTP
 * is deleted so it can't be brute-forced; the user must request a new one.
 * Throws BadRequestError on failure, returns the OTP document on success (not consumed).
 */
export async function verifyOTP(email: string | undefined, type: OTPType, otp: string) {
    if (!email) throw new BadRequestError("Invalid or expired OTP");

    const otpData = await OTPModel.findOne({ email, type });
    if (!otpData) throw new BadRequestError("Invalid or expired OTP");

    const isMatch = await bcrypt.compare(otp, otpData.otp);

    if (!isMatch) {
        const updated = await OTPModel.findByIdAndUpdate(otpData._id, { $inc: { attempts: 1 } }, { new: true });

        if (!updated || updated.attempts >= OTP_MAX_ATTEMPTS) {
            await OTPModel.findByIdAndDelete(otpData._id);
            throw new BadRequestError("Too many failed attempts, please request a new OTP");
        }

        throw new BadRequestError("Invalid OTP");
    }

    return otpData;
}

/** Verify an OTP and delete it so it can't be reused. */
export async function consumeOTP(email: string | undefined, type: OTPType, otp: string) {
    const otpData = await verifyOTP(email, type, otp);
    await OTPModel.findByIdAndDelete(otpData._id);
    return otpData;
}
