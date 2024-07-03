import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/otp", "/forgot", "/register"];

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const refreshToken = req.cookies.get("refreshToken");
    const accessToken = req.cookies.get("accessToken");

    if (!accessToken && !refreshToken && !publicRoutes.includes(path)) {
        const absoluteURL = new URL("/login", req.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    } else {
        return NextResponse.next();
    }
}
