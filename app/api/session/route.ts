// app/api/session/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // Forward headers from the incoming request to auth
        const headers = new Headers(req.headers);
        const session = await auth.api.getSession({
            headers,
        });

        if (!session) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
        }

        // Return session (be careful about shape & size)
        return NextResponse.json({ success: true, session });
    } catch (err) {
        console.error("session route error", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
