"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input } from "@nextui-org/react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { useAuthStore } from "@/hooks/store";
import { useLoading } from "@/hooks";
import { IUser } from "@/types/user";
import { GoogleIcon } from "@/assets/icons";

interface IUserLogin {
    password: string;
    email: string;
}

export default function LoginPage() {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<IUserLogin>();

    const router = useRouter();
    const { loading, startLoading, stopLoading } = useLoading();
    const { isAuthenticated, setAuth } = useAuthStore();

    const toggleVisibility = () => setIsVisible(!isVisible);

    const onSubmitHandler = async (formData: IUserLogin, e?: React.BaseSyntheticEvent): Promise<void> => {
        e?.preventDefault();

        try {
            startLoading();
            const response = await axios.post(
                process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/login",
                {
                    email: formData.email,
                    password: formData.password,
                },
                { withCredentials: true }
            );

            if (!isAuthenticated) {
                const user = response.data?.data as IUser;
                useAuthStore.setState({
                    currentUser: user,
                    isAuthenticated: true,
                    // accessToken: response.data?.accessToken,
                    // refreshToken: response.data?.refreshToken,
                });
            }

            router.push("/");
        } catch (error: any) {
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

    const handleLoginWithGoogle = () => {
        const googleLoginURL = process.env.NEXT_PUBLIC_API_BASE_URL + "/auth/google";
        window.open(googleLoginURL, "_self");
    };

    return (
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Sign in</h1>
                    <p className="text-balance text-muted-foreground">Enter your account to sign in</p>
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
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <label htmlFor="password">Password</label>

                            <Link href="/forgot" className="ml-auto text-sm underline">
                                Forgot password?
                            </Link>
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
                    {errors.root?.server && (
                        <p className="text-red-500 text-tiny my-2 text-center">{errors.root?.server?.message}</p>
                    )}
                    <Button isLoading={loading} size="lg" color="primary" type="submit" className="w-full">
                        Login
                    </Button>
                    <Button
                        size="lg"
                        variant="bordered"
                        className="w-full"
                        startContent={<GoogleIcon />}
                        onClick={handleLoginWithGoogle}
                    >
                        Login with Google
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
}
