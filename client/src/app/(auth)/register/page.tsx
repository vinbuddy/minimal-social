"use client";
import useLoading from "@/hooks/useLoading";
import axiosInstance from "@/utils/httpRequest";
import { Button, Input } from "@nextui-org/react";
import axios from "axios";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface IUserRegister {
    username: string;
    password: string;
    email: string;
    confirm: string;
}

export default function RegisterPage() {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const { loading, startLoading, stopLoading } = useLoading();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<IUserRegister>();

    const toggleVisibility = () => setIsVisible(!isVisible);
    const onSubmitHandler = async (data: IUserRegister, e?: React.BaseSyntheticEvent): Promise<void> => {
        e?.preventDefault();

        try {
            // Send email otp
            startLoading();
            const response = await axios.post(
                (process.env.NEXT_PUBLIC_API_BASE_URL as string) + "/auth/register",
                {
                    username: data.username,
                    email: data.email,
                    password: data.password,
                },
                { withCredentials: true }
            );

            toast.success("OTP sent to your email", {
                position: "bottom-center",
            });
            router.push(`/otp?type=register&toEmail=${data.email}`);
        } catch (error: any) {
            console.log("error: ", error);
            setError("root.server", {
                type: "server",
                message: error?.response?.data?.message || error?.message,
            });
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
                    <h1 className="text-3xl font-bold">Sign up</h1>
                    <p className="text-balance text-muted-foreground">Enter your information to create an account</p>
                </div>
                <form onSubmit={handleSubmit(onSubmitHandler)} className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="email">User name</label>
                        <Input
                            size="lg"
                            classNames={{ inputWrapper: "px-0 overflow-hidden", input: "px-3" }}
                            id="username"
                            type="text"
                            placeholder="John Doe"
                            {...register("username", {
                                required: true,
                                maxLength: 50,
                            })}
                        />
                        {errors?.username?.type === "required" && (
                            <p className="text-red-500 text-tiny">Please enter user name</p>
                        )}
                    </div>
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
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <label htmlFor="password">Password</label>
                        </div>
                        <Input
                            size="lg"
                            classNames={{
                                mainWrapper: "relative",
                                inputWrapper: "px-0 overflow-hidden",
                                input: "px-3",
                            }}
                            id="password"
                            type={isVisible ? "text" : "password"}
                            {...register("password", {
                                required: true,
                                minLength: 8,
                                maxLength: 15,
                            })}
                            endContent={
                                <button
                                    className="focus:outline-none absolute bottom-[50%] translate-y-1/2 right-3"
                                    type="button"
                                    onClick={toggleVisibility}
                                >
                                    {isVisible ? (
                                        <EyeOffIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                        />
                        {errors.password?.type === "required" && (
                            <p className="text-red-500 text-tiny">Please enter password</p>
                        )}
                        {errors.password?.type === "minLength" && (
                            <p className="text-red-500 text-tiny">Password must be at least 8 characters long</p>
                        )}
                        {errors.password?.type === "maxLength" && (
                            <p className="text-red-500 text-tiny">Password must not exceed 15 characters</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <label htmlFor="password">Confirm Password</label>
                        </div>
                        <Input
                            size="lg"
                            classNames={{
                                mainWrapper: "relative",
                                inputWrapper: "px-0 overflow-hidden",
                                input: "px-3",
                            }}
                            id="confirm"
                            type={isVisible ? "text" : "password"}
                            {...register("confirm", {
                                required: true,
                                validate: (value) => {
                                    if (watch("password") !== value || watch("password") === "")
                                        return "Your password do not match";
                                },
                            })}
                            endContent={
                                <button
                                    className="focus:outline-none absolute bottom-[50%] translate-y-1/2 right-3"
                                    type="button"
                                    onClick={toggleVisibility}
                                >
                                    {isVisible ? (
                                        <EyeOffIcon className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <EyeIcon className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                        />
                        {errors.confirm?.type === "validate" && (
                            <p className="text-red-500 text-tiny">{errors.confirm?.message}</p>
                        )}
                        {errors.confirm?.type === "required" && (
                            <p className="text-red-500 text-tiny">Please enter confirm password</p>
                        )}
                    </div>
                    {errors.root?.server && (
                        <p className="text-red-500 text-tiny my-2 text-center">{errors.root?.server?.message}</p>
                    )}

                    <Button isLoading={loading} size="lg" color="primary" type="submit" className="w-full">
                        Create an account
                    </Button>
                    {/* <Button variant="bordered" className="w-full">
                        Login with Google
                    </Button> */}
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
