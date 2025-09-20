"use server";

import { v4 as uuidv4 } from "uuid";
import { db } from "@/db/drizzle";
import { publishedBlogs } from "@/db/schema/publish";
import { blog as blogContent, usersBlogs } from "@/db/schema/blog";
import { eq } from "drizzle-orm";

type PublishBlogParams = {
    userBlogId: string;
    bannerImageId?: string | null;
    imageSource?: string | null;
    visibility?: "Public" | "Unlisted";
};

export async function publishBlog({
    userBlogId,
    bannerImageId = null,
    imageSource = null,
    visibility = "Public",
}: PublishBlogParams) {
    try {
        const result = await db.transaction(async (tx) => {
            const ubRows = await tx.select().from(usersBlogs).where(eq(usersBlogs.id, userBlogId));
            if (!ubRows || ubRows.length === 0) {
                return { success: false, message: "Blog (users_blogs) not found" };
            }
            const ub = ubRows[0];

            let contentRows = await tx.select().from(blogContent).where(eq(blogContent.userBlogId, userBlogId));

            if (!contentRows || contentRows.length === 0) {
                const newContentId = uuidv4();
                const [newContent] = await tx
                    .insert(blogContent)
                    .values({
                        id: newContentId,
                        userBlogId: userBlogId,
                        author: ub.email ?? "",
                        email: ub.email ?? "",
                        heading: ub.heading ?? "Untitled",
                        content: "",
                        parsed: "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .returning();

                contentRows = [newContent];
            }

            const content = contentRows[0];

            const alreadyPublished = await tx.select().from(publishedBlogs).where(eq(publishedBlogs.userBlogId, userBlogId));

            if (alreadyPublished && alreadyPublished.length > 0) {
                const [updated] = await tx
                    .update(publishedBlogs)
                    .set({
                        bannerImage: bannerImageId ?? null,
                        imageSource: imageSource ?? null,
                        visibility,
                        updatedAt: new Date(),
                    })
                    .where(eq(publishedBlogs.userBlogId, userBlogId))
                    .returning();

                return {
                    success: true,
                    message: "Blog publish metadata updated",
                    published: updated,
                };
            }

            const [inserted] = await tx
                .insert(publishedBlogs)
                .values({
                    userBlogId,
                    bannerImage: bannerImageId ?? null,
                    imageSource: imageSource ?? null,
                    visibility,
                    publishedAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning();

            return {
                success: true,
                message: "Blog published successfully",
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
