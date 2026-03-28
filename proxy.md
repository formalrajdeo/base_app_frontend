import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
    const isAuthPage =
        req.nextUrl.pathname === "/" ||
        req.nextUrl.pathname === "/signup";

    const token = req.cookies.get("better-auth.session_token");

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(
            new URL("/dashboard", req.url)
        );
    }

    return NextResponse.next();
}