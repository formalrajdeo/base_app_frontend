// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // const token = req.cookies.get("better-auth.session_token"); // or session cookie
    const token = req.cookies.getAll().find(
        (c) => c.name === "better-auth.session_token"
    );

    if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}