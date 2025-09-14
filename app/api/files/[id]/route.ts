import { db } from "@/db/drizzle";
import { files } from "@/db/schema/file";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const p = await params;
    const id = p.id;
    if (Number.isNaN(id)) {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const rows = await db.select().from(files).where(eq(files.id, id));
    const file = rows[0];

    if (!file) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const raw: unknown = file.data;
    let u8: Uint8Array;

    if (raw instanceof Uint8Array) {
        u8 = raw;
    } else if (ArrayBuffer.isView(raw)) {
        const view = raw as ArrayBufferView;
        u8 = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    } else if (raw instanceof ArrayBuffer) {
        u8 = new Uint8Array(raw);
    } else if (typeof raw === "string") {
        const buf = Buffer.from(raw, "base64");
        u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    } else {
        const b = Buffer.from(raw as any);
        u8 = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    }

    const copy = new Uint8Array(u8.byteLength);
    copy.set(u8);

    const arrayBuffer = copy.buffer;

    return new NextResponse(arrayBuffer, {
        headers: {
            "Content-Type": file.mimetype || "application/octet-stream",
            "Content-Disposition": `inline; filename="${file.filename}"`,
            "Content-Length": String(copy.byteLength),
        },
    });
}
