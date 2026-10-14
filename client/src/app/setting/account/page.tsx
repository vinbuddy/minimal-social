"use client";

import { Avatar, Button, Chip, Input } from "@heroui/react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";

import { UserName } from "@/components/user";
import { useAuthStore } from "@/hooks/store";
import { GoogleIcon, VerifiedIcon } from "@/assets/icons";
import { OtpVerification } from "@/components";
import { useLoading } from "@/hooks";
import axiosInstance from "@/utils/http-request";
import { showToast } from "@/utils/toast";

interface IChangePassword {
    password: string;
    newPassword: string;
    confirmPassword: string;
}

export default function SettingAccountPage() {
    const { currentUser } = useAuthStore();
    const [otp, setOtp] = useState<string>("");
    const [isShowOtp, setIsShowOtp] = useState<boolean>(false);
    const { loading, startLoading, stopLoading } = useLoading();
    const { loading: verifyLoading, startLoading: startVerifyLoading, stopLoading: stopVerifyLoading } = useLoading();

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
        reset,
    } = useForm<IChangePassword>();

    const formValuesWatched = watch();

    const resendOtp = async (formData: IChangePassword) => {
        try {
            startLoading();

            await axiosInstance.post("/account/change-password", {
                password: formData.password,
                newPassword: formData.newPassword,
            });

            setIsShowOtp(true);

            showToast("Otp is sent to your email", "success");
        } catch (error: any) {
            showToast(error?.response?.data?.message || error.message, "error");
        } finally {
            stopLoading();
        }
    };

    const onSubmitHandler = async (formData: IChangePassword, e?: React.BaseSyntheticEvent): Promise<void> => {
        e?.preventDefault();

        resendOtp(formData);
    };

    const handleResendChangePasswordOTP = async () => {
        await resendOtp(formValuesWatched);
    };

    const handleVerifyChangePasswordOTP = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            startVerifyLoading();

            await axiosInstance.post("/account/change-password/verify", {
                otp: otp,
            });

            setIsShowOtp(false);

            // Clear the form
            reset();

            showToast("Password changed successfully", "success");
        } catch (error: any) {
            showToast(error?.response?.data?.message || error.message, "error");
        } finally {
            stopVerifyLoading();
        }
    };

    return (
        <div className="flex justify-center">
            <div className="w-full md:max-w-xl">
                <section className="flex flex-col gap-5">
                    {/* General info */}
                    <div className="flex flex-wrap items-center gap-5">
                        <Avatar
                            classNames={{
                                base: "h-36 w-36",
                            }}
                            isBordered
                            color="default"
                            size="lg"
                            showFallback={false}
                            src={
                                currentUser?.photo ??
                                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTIlcun59hjzIIjphLcoczCdFuaSyOpwDpFyHtp1R9WTq-MfqlfCtP4jTjJf94buMJfHw&usqp=CAU"
                            }
                        />

                        <div>
                            <UserName className="text-2xl" user={currentUser} />

                            <Chip className="mt-2">{currentUser?.email}</Chip>

                            <div className="mt-2">
                                {currentUser?.googleId && (
                                    <Chip variant="light" startContent={<GoogleIcon size={16} />}>
                                        Sign in with Google
                                    </Chip>
                                )}
                            </div>

                            <div className="mt-2">
                                {currentUser?.isVerified && (
                                    <Chip variant="light" startContent={<VerifiedIcon size={16} />}>
                                        Account is verified
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Change password */}
                <section className="mt-10 pt-10 border-t border-default">
                    {!isShowOtp && (
                        <div>
                            <h2 className="text-xl font-semibold mb-5">Change password</h2>
                            <form onSubmit={handleSubmit(onSubmitHandler)}>
                                <div className="grid gap-2">
                                    <Input
                                        size="lg"
                                        classNames={{
                                            mainWrapper: "relative",
                                            inputWrapper: "px-0 overflow-hidden",
                                            input: "px-3",
                                        }}
                                        id="password"
                                        type="password"
                                        placeholder="Current password"
                                        {...register("password", {
                                            required: true,
                                            minLength: 8,
                                            maxLength: 15,
                                        })}
                                    />
                                    <div className="flex justify-end">
                                        <Link href="/forgot" className="text-sm text-link underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    {errors.password?.type === "required" && (
                                        <p className="text-red-500 text-tiny">Please enter password</p>
                                    )}
                                    {errors.password?.type === "minLength" && (
                                        <p className="text-red-500 text-tiny">
                                            Password must be at least 8 characters long
                                        </p>
                                    )}
                                    {errors.password?.type === "maxLength" && (
                                        <p className="text-red-500 text-tiny">Password must not exceed 15 characters</p>
                                    )}
                                </div>
                                <div className="grid gap-2 mt-4">
                                    <Input
                                        size="lg"
                                        classNames={{
                                            mainWrapper: "relative",
                                            inputWrapper: "px-0 overflow-hidden",
                                            input: "px-3",
                                        }}
                                        id="newPassword"
                                        type="password"
                                        placeholder="New password"
                                        {...register("newPassword", {
                                            required: true,
                                            minLength: 8,
                                            maxLength: 15,
                                        })}
                                    />

                                    {errors.newPassword?.type === "required" && (
                                        <p className="text-red-500 text-tiny">Please enter password</p>
                                    )}
                                    {errors.newPassword?.type === "minLength" && (
                                        <p className="text-red-500 text-tiny">
                                            Password must be at least 8 characters long
                                        </p>
                                    )}
                                    {errors.newPassword?.type === "maxLength" && (
                                        <p className="text-red-500 text-tiny">Password must not exceed 15 characters</p>
                                    )}
                                </div>
                                <div className="grid gap-2 mt-4">
                                    <Input
                                        size="lg"
                                        classNames={{
                                            mainWrapper: "relative",
                                            inputWrapper: "px-0 overflow-hidden",
                                            input: "px-3",
                                        }}
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Confirm password"
                                        {...register("confirmPassword", {
                                            required: true,
                                            validate: (value) => value === watch("newPassword"),
                                        })}
                                    />
                                    {errors.confirmPassword?.type === "required" && (
                                        <p className="text-red-500 text-tiny">Please enter password</p>
                                    )}
                                    {errors.confirmPassword?.type === "validate" && (
                                        <p className="text-red-500 text-tiny">Passwords do not match</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="mt-5"
                                    fullWidth
                                    color="primary"
                                    size="lg"
                                >
                                    Save changes
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Verify OTP */}
                    {isShowOtp && (
                        <div>
                            <form onSubmit={handleVerifyChangePasswordOTP} className="flex flex-col items-center">
                                <div className="flex flex-col items-center justify-center text-center mb-5">
                                    <p className="font-semibold text-3xl">OTP Verification</p>
                                    <p className="flex flex-row text-sm font-medium text-gray-400 mt-2">
                                        We have sent a code to your email
                                    </p>
                                </div>
                                <OtpVerification
                                    size="md"
                                    toEmail=""
                                    onResendOtp={handleResendChangePasswordOTP}
                                    onValueChange={(otp) => setOtp(otp)}
                                />
                                <Button
                                    className="mt-5 md:px-10"
                                    type="submit"
                                    color="primary"
                                    size="md"
                                    radius="full"
                                    isLoading={verifyLoading}
                                >
                                    Verify OTP
                                </Button>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
