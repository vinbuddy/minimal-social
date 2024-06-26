import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Sign up</h1>
                    <p className="text-balance text-muted-foreground">Enter your information to create an account</p>
                </div>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <label htmlFor="password">Password</label>
                            <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input id="password" type="password" required />
                    </div>
                    <Button color="primary" type="submit" className="w-full">
                        Create an account
                    </Button>
                    {/* <Button variant="bordered" className="w-full">
                        Login with Google
                    </Button> */}
                </div>
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
