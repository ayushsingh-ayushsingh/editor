"use server";

import { db } from "@/db/drizzle";
import { publishedBlogs } from "@/db/schema/publish";
import { eq, desc } from "drizzle-orm";

export async function getPublishedBlogByUserBlogId(userBlogId: string) {
    if (!userBlogId) return { success: false, message: "Missing userBlogId", published: null };

    try {
        const rows = await db
            .select()
            .from(publishedBlogs)
            .where(eq(publishedBlogs.id, userBlogId))
            .orderBy(desc(publishedBlogs.publishedAt))
            .limit(1);

        if (!rows || rows.length === 0) {
            return { success: true, published: null };
        }

        return { success: true, published: rows[0] };
    } catch (err) {
        console.error("getPublishedBlogByUserBlogId error:", err);
        return { success: false, message: (err as Error).message ?? "Failed", published: null };
    }
}
