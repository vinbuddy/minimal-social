"use client";
import useAuthStore from "@/libs/hooks/store/useAuthStore";
import useLoading from "@/libs/hooks/useLoading";
import { IUser } from "@/libs/types/user";
import axiosInstance from "@/utils/httpRequest";
import { Button } from "@nextui-org/react";
import axios from "axios";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 6;

export default function OtpPage({ searchParams }: { searchParams: { type: "register" | "forgot"; toEmail: string } }) {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const isDisabled = otp.some((value) => value === "");
    const inputsRef = useRef<HTMLInputElement[]>(Array(OTP_LENGTH).fill(null));
    const [errorResponse, setErrorResponse] = useState<string | null>(null);

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

        if (searchParams?.type === "register") {
            handleVerifyRegister();
        } else {
            // Verify OTP forgot password
            handleVerifyForgotPassword();
        }
    };

    const handleVerifyRegister = async () => {
        // Verify OTP register
        try {
            startLoading();

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/verify-otp",
                {
                    email: searchParams?.toEmail,
                    otp: otp.join(""),
                },
                { withCredentials: true }
            );

            if (response.status !== 200) {
                setErrorResponse(response.data?.message);
                // throw new Error(response.data?.message);
            }

            toast.success("Account registered successfully", { position: "bottom-center" });
            router.push("/login");
        } catch (error: any) {
            toast.error(error?.message, { position: "bottom-center" });
        } finally {
            stopLoading();
        }
    };

    const handleVerifyForgotPassword = async () => {
        // Verify OTP register
        try {
            startLoading();

            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/forgot/verify",
                {
                    email: searchParams?.toEmail,
                    otp: otp.join(""),
                },
                { withCredentials: true }
            );

            useAuthStore.setState((state) => ({ forgotPasswordOTP: otp.join("") }));

            toast.success("Verify successfully", { position: "bottom-center" });
            router.push(`/reset?email=${searchParams?.toEmail}`);
        } catch (error: any) {
            setErrorResponse(error?.response?.data?.message || error?.message);

            toast.error(error?.message, { position: "bottom-center" });
        } finally {
            stopLoading();
        }
    };

    const resendOTP = async () => {
        try {
            startLoading();
            let url =
                searchParams?.type === "forgot"
                    ? process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/forgot"
                    : process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/register";
            const response = await axios.post(url, {
                email: searchParams?.toEmail,
            });

            if (response.status === 200) {
                toast.success("Resend OTP successfully", {
                    position: "bottom-center",
                });
            }
        } catch (error: any) {
            setErrorResponse(error?.response?.data?.message || error?.message);

            toast.error(error?.message, {
                position: "bottom-center",
            });
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
                            <p>OTP Verification</p>
                        </div>
                        <div className="flex flex-row text-sm font-medium text-gray-400">
                            <p>We have sent a code to your email {searchParams?.toEmail}</p>
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
                                    {errorResponse && (
                                        <p className="text-red-500 text-tiny my-2 text-center">{errorResponse}</p>
                                    )}
                                    <div>
                                        <Button
                                            isLoading={loading}
                                            type="submit"
                                            isDisabled={isDisabled}
                                            color={isDisabled ? "default" : "primary"}
                                            size="lg"
                                            fullWidth
                                        >
                                            Verify OTP
                                        </Button>
                                    </div>

                                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                        <p>Did not recieve code?</p>{" "}
                                        <p
                                            onClick={resendOTP}
                                            className="flex flex-row items-center text-blue-600 cursor-pointer"
                                        >
                                            Resend
                                        </p>
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
