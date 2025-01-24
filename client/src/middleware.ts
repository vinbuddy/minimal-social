import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/otp", "/forgot", "/reset"];

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const refreshToken = req.cookies.get("refreshToken");
    const accessToken = req.cookies.get("accessToken");

    // if (!accessToken && !refreshToken && !publicRoutes.includes(path)) {
    //     const absoluteURL = new URL("/login", req.nextUrl.origin);
    //     return NextResponse.redirect(absoluteURL.toString());
    // }

    // if (accessToken && publicRoutes.includes(path)) {
    //     const absoluteURL = new URL("/", req.nextUrl.origin);
    //     return NextResponse.redirect(absoluteURL.toString());
    // }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
