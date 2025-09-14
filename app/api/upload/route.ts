import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { files } from "@/db/schema/file";
import { Buffer } from "buffer";

export const dynamic = "force-dynamic";
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: "File too large. Maximum allowed size is 30 MB." },
                { status: 413 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const inserted = await db
            .insert(files)
            .values({
                filename: file.name,
                mimetype: file.type || "application/octet-stream",
                data: buffer,
            })
            .returning();

        const created = inserted[0];

        return NextResponse.json({
            success: true,
            id: created.id,
            filename: created.filename,
            mimetype: created.mimetype,
        });
    } catch (err: any) {
        console.error("upload error:", err);
        return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
    }
}
