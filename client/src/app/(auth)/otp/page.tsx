"use client";
import useAuthStore from "@/libs/hooks/store/useAuthStore";
import useLoading from "@/libs/hooks/useLoading";
import { IUser } from "@/libs/types/user";
import axiosInstance from "@/utils/httpRequest";
import { Button } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 6;

export default function OtpPage({ searchParams }: { searchParams: { type: "register" | "forgot"; toEmail: string } }) {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const isDisabled = otp.some((value) => value === "");
    const inputsRef = useRef<HTMLInputElement[]>(Array(OTP_LENGTH).fill(null));

    const { currentUser, setAuth } = useAuthStore();
    const { loading, startLoading, stopLoading } = useLoading();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newPin = [...otp];
        newPin[index] = value;
        setOtp(newPin);

        // Move to the next input
        if (value.length === 1 && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        // Move to the previous input
        if (value.length === 0 && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
            // Move focus to the previous input field on backspace
            inputsRef.current[index - 1].focus();
        }
    };

    const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (searchParams.type === "register") {
            handleVerifyRegister();
        }

        // Verify OTP forgot password
    };

    const handleVerifyRegister = async () => {
        // Verify OTP register
        try {
            startLoading();

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/verify-otp",
                {
                    email: searchParams.toEmail,
                    otp: otp.join(""),
                },
                { withCredentials: true }
            );

            if (response.status === 200) {
                router.push("/login");
            }
        } catch (error: any) {
            toast.error(error?.message, { position: "bottom-center" });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
            <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
                <div className="mx-auto flex w-full max-w-lg flex-col space-y-16">
                    <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <div className="font-semibold text-3xl">
                            <p>Email Verification</p>
                        </div>
                        <div className="flex flex-row text-sm font-medium text-gray-400">
                            <p>We have sent a code to your email ba**@dipainhouse.com</p>
                        </div>
                    </div>

                    <div>
                        <form onSubmit={handleVerify} action="" method="post">
                            <div className="flex flex-col space-y-16">
                                <div className="flex flex-row items-center justify-between w-full">
                                    {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                                        <div className="w-16 h-16 " key={index}>
                                            <input
                                                maxLength={1}
                                                className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-slate-100 focus:bg-gray-50 focus:ring-1 ring-primary"
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

                                <div className="flex flex-col space-y-5">
                                    <div>
                                        <Button
                                            isLoading={loading}
                                            type="submit"
                                            isDisabled={isDisabled}
                                            color={isDisabled ? "default" : "primary"}
                                            size="lg"
                                            fullWidth
                                        >
                                            Verify Account
                                        </Button>
                                    </div>

                                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                        <p>Did not recieve code?</p>{" "}
                                        <a
                                            className="flex flex-row items-center text-blue-600"
                                            href="http://"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Resend
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
