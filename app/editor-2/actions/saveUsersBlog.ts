"use server";

import { db } from "@/db/drizzle";
import { blog as blogContent, usersBlogs } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { getInitialContent, extractPlainTextFromBlocks } from "../initialBlock";

export async function createNewBlog(email: string, author: string) {
    const newBlogId = uuidv4();
    const newContentId = uuidv4();

    const content = getInitialContent();
    const plainText = extractPlainTextFromBlocks(content).replace(/\s+/g, " ").trim();

    // Content heading (first 30 chars of plainText or Untitled)
    const contentHeading = plainText.length > 0 ? plainText.substring(0, 30) : "Untitled";

    try {
        await db.transaction(async (tx) => {
            await tx.insert(usersBlogs).values({
                id: newBlogId,
                email,
                heading: contentHeading,
            });

            await tx.insert(blogContent).values({
                id: newContentId,
                userBlogId: newBlogId,
                author,
                email,
                content: JSON.stringify(content),
                parsed: plainText,
                heading: contentHeading,
            });
        });

        console.log("New blog created:", contentHeading);

        return {
            success: true,
            message: "New Blog Created",
            newBlogId,
            newContentId,
            heading: contentHeading,
        };
    } catch (error) {
        console.error("Failed to create blog:", error);
        return { success: false, message: "Failed to create new blog!" };
    }
}

export async function updateBlogById(
    id: string,
    heading: string,
    content: string,
    parsed: string
) {
    try {
        await db.transaction(async (tx) => {
            await tx
                .update(blogContent)
                .set({
                    content,
                    parsed,
                    heading: parsed.substring(0, 30) || "Untitled", // safe fallback
                    updatedAt: new Date(),
                })
                .where(eq(blogContent.userBlogId, id));

            await tx
                .update(usersBlogs)
                .set({
                    heading: heading || "Untitled",
                    updatedAt: new Date(),
                })
                .where(eq(usersBlogs.id, id));
        });

        console.log("Blog updated:", id);

        return {
            success: true,
            message: "Blog saved",
        };
    } catch (error) {
        console.error("Failed to update blog:", error);
        return { success: false, message: "Failed to update blog!" };
    }
}
