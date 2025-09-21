"use server";

import { db } from "@/db/drizzle";
import { publishedBlogs } from "@/db/schema/publish";
import { blog as BlogTable } from "@/db/schema/blog";
import { eq } from "drizzle-orm";

type PublishBlogParams = {
    blogId: string;
    bannerImageId?: string | null;
    imageSource?: string | null;
    visibility?: "Public" | "Unlisted";
};

export async function publishBlog({
    blogId,
    bannerImageId = null,
    imageSource = null,
    visibility = "Public",
}: PublishBlogParams) {
    if (!blogId) {
        return { success: false, message: "Missing blogId" };
    }

    try {
        const result = await db.transaction(async (tx) => {
            const blogRows = await tx.select().from(BlogTable).where(eq(BlogTable.userBlogId, blogId)).limit(1);
            if (!blogRows || blogRows.length === 0) {
                return { success: false, message: "Blog row not found" };
            }
            const b = blogRows[0];

            const [inserted] = await tx
                .insert(publishedBlogs)
                .values({
                    bannerImage: bannerImageId ?? null,
                    imageSource: imageSource ?? null,
                    sourceUserBlogId: blogId,
                    visibility,
                    author: b.author,
                    email: b.email,
                    heading: b.heading,
                    content: b.content,
                    parsed: b.parsed,
                    likesCount: 0,
                    dislikesCount: 0,
                    commentsCount: 0,
                    publishedAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return {
                success: true,
                message: "New Blog published",
                published: inserted,
            };
        });

        return result;
    } catch (error) {
        console.error("publishBlog error:", error);
        return {
            success: false,
            message: "Failed to publish blog",
            error: (error as Error).message ?? String(error),
        };
    }
}
