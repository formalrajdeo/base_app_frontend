import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define which routes are protected and which are auth pages
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/"];

export function proxy(req: NextRequest) {
    const token = req.cookies.get("better-auth.session_token")?.value || "";
    const { pathname } = req.nextUrl;

    // 🚫 Not logged in → block protected pages
    if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // ✅ Logged in → block public pages (login)
    if (token && publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

// Apply middleware only to relevant paths
export const config = {
    matcher: ["/dashboard/:path*", "/"],
};