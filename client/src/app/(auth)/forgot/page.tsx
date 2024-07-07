"use client";

import useLoading from "@/hooks/useLoading";
import { Button, Input } from "@nextui-org/react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface IForgotPassword {
    email: string;
}

export default function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IForgotPassword>();

    const { loading, startLoading, stopLoading } = useLoading();
    const router = useRouter();

    const onSubmitHandler = async (formData: IForgotPassword, e?: React.BaseSyntheticEvent): Promise<void> => {
        try {
            startLoading();
            const response = await axios.post(process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/forgot", {
                email: formData.email,
            });

            if (response.status === 200) {
                toast.success("OTP sent to your email address", {
                    position: "bottom-center",
                });

                router.push(`/otp?type=forgot&toEmail=${formData.email}`);
            }
        } catch (error: any) {
            toast.error(error?.message, {
                position: "bottom-center",
            });
        } finally {
            stopLoading();
        }
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Forgot password</h1>
                    <p className="text-balance text-muted-foreground">Enter your email to reset password</p>
                </div>
                <form onSubmit={handleSubmit(onSubmitHandler)} className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input
                            size="lg"
                            classNames={{ inputWrapper: "px-0 overflow-hidden", input: "px-3" }}
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...register("email", {
                                required: true,
                                pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            })}
                        />
                        {errors.email?.type === "required" && (
                            <p className="text-red-500 text-tiny">Please enter email address</p>
                        )}
                        {errors.email?.type === "pattern" && (
                            <p className="text-red-500 text-tiny">Please enter a valid email address</p>
                        )}
                    </div>

                    <Button isLoading={loading} size="lg" color="primary" type="submit" className="w-full">
                        Send OTP
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
