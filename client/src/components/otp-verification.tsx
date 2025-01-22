"use client";
import { useRef, useState } from "react";
import cn from "classnames";
import axios from "axios";
import { showToast } from "@/utils/toast";
import { useLoading } from "@/hooks";

interface IProps {
    toEmail: string;
    size: "sm" | "md" | "lg";
    onValueChange?: (otp: string) => void;
    onResendOtp?: () => Promise<void> | void;
}

const OTP_LENGTH = 6;

export default function OtpVerification({ size = "lg", onResendOtp, onValueChange }: IProps) {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const inputsRef = useRef<HTMLInputElement[]>(Array(OTP_LENGTH).fill(null));
    const { loading, startLoading, stopLoading } = useLoading();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newPin = [...otp];
        newPin[index] = value;
        setOtp(newPin);
        onValueChange?.(newPin.join(""));

        if (value.length === 1 && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        if (value.length === 0 && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
            inputsRef.current[index - 1].focus();
        }
    };

    const handleResendOTP = async () => {
        if (!onResendOtp) {
            return;
        }

        try {
            startLoading();

            await onResendOtp();

            stopLoading();
        } catch (error: any) {
            showToast(error?.response?.data?.message || error?.message, "error");
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center gap-4 justify-center w-full">
                {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                    <div
                        className={cn({
                            "w-10 h-10": size === "sm",
                            "w-14 h-14": size === "md",
                            "w-16 h-16": size === "lg",
                        })}
                        key={index}
                    >
                        <input
                            maxLength={1}
                            className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl text-lg bg-content2 focus:bg-content3 focus:ring-1 ring-primary"
                            type="text"
                            value={otp[index]}
                            ref={(ref) => {
                                inputsRef.current[index] = ref as HTMLInputElement;
                            }}
                            onChange={(e) => handleChange(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500 my-4">
                <p>Did not recieve code?</p>{" "}
                <p className="flex flex-row items-center text-blue-600 cursor-pointer" onClick={handleResendOTP}>
                    {loading ? "Resending..." : "Resend OTP"}
                </p>
            </div>
        </div>
    );
}
