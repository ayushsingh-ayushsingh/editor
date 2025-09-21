// app/actions/getPublishedWithBlogById.ts (server)
"use server";

import { db } from "@/db/drizzle";
import { publishedBlogs } from "@/db/schema/publish";
import { blog as BlogTable } from "@/db/schema/blog";
import { eq, desc } from "drizzle-orm";

export async function getPublishedWithBlogById(publishedId: string) {
    if (!publishedId) {
        return { success: false, message: "Missing publishedId", published: null, blog: null };
    }

    try {
        // get the published row
        const pubRows = await db.select().from(publishedBlogs).where(eq(publishedBlogs.id, publishedId)).limit(1);
        if (!pubRows || pubRows.length === 0) {
            return { success: true, published: null, blog: null };
        }
        const published = pubRows[0];

        // if sourceUserBlogId exists, fetch latest blog for that master
        let blogRow = null;
        if (published.sourceUserBlogId) {
            const blogRows = await db
                .select()
                .from(BlogTable)
                .where(eq(BlogTable.userBlogId, published.sourceUserBlogId))
                .orderBy(desc(BlogTable.createdAt))
                .limit(1);

            if (blogRows && blogRows.length > 0) blogRow = blogRows[0];
        }

        return { success: true, published, blog: blogRow ?? null };
    } catch (err) {
        console.error("getPublishedWithBlogById error:", err);
        return { success: false, message: (err as Error).message ?? "Failed", published: null, blog: null };
    }
}
