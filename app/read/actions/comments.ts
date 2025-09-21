"use server";

import { db } from "@/db/drizzle";
import { publishedBlogs, blogComments } from "@/db/schema/publish";
import { eq, asc } from "drizzle-orm";

type ActionResult<T = unknown> = {
    success: boolean;
    message?: string;
    data?: T;
    commentsCount?: number;
};

export async function addComment(
    publishedId: string,
    userEmail: string,
    userName: string,
    content: string,
    userAvatar?: string,
    parentCommentId?: string | null
): Promise<ActionResult> {
    if (!publishedId || !userEmail || !content || content.trim().length === 0) {
        return { success: false, message: "Missing or invalid input" };
    }

    try {
        const res = await db.transaction(async (tx) => {
            const pub = await tx.select().from(publishedBlogs).where(eq(publishedBlogs.id, publishedId));
            if (!pub || pub.length === 0) {
                return { success: false, message: "Published post not found" } as ActionResult;
            }

            if (parentCommentId) {
                const parent = await tx.select().from(blogComments).where(eq(blogComments.id, parentCommentId));
                if (!parent || parent.length === 0) {
                    return { success: false, message: "Parent comment not found" } as ActionResult;
                }
                if (parent[0].blogId !== publishedId) {
                    return { success: false, message: "Parent comment does not belong to this post" } as ActionResult;
                }
            }

            const [inserted] = await tx.insert(blogComments).values({
                blogId: publishedId,
                userEmail,
                userName,
                userAvatar: userAvatar ?? null,
                parentCommentId: parentCommentId ?? null,
                content: content.trim(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            const allComments = await tx.select().from(blogComments).where(eq(blogComments.blogId, publishedId));
            const commentsCount = allComments.length;

            await tx.update(publishedBlogs).set({ commentsCount }).where(eq(publishedBlogs.id, publishedId));

            return {
                success: true,
                message: "Comment added",
                data: inserted,
                commentsCount,
            } as ActionResult;
        });

        return res;
    } catch (err) {
        console.error("addComment error:", err);
        return { success: false, message: (err as Error).message ?? "Failed to add comment" };
    }
}

export async function getCommentsByPublishedId(publishedId: string) {
    if (!publishedId) {
        return { success: false, message: "Missing publishedId", comments: [] as any[] };
    }

    try {
        const comments = await db
            .select()
            .from(blogComments)
            .where(eq(blogComments.blogId, publishedId))
            .orderBy(asc(blogComments.createdAt));

        return { success: true, comments };
    } catch (err) {
        console.error("getCommentsByPublishedId error:", err);
        return { success: false, message: (err as Error).message ?? "Failed to fetch comments", comments: [] as any[] };
    }
}

export async function editCommentById(commentId: string, userEmail: string, content: string): Promise<ActionResult> {
    if (!commentId || !userEmail || !content || content.trim().length === 0) {
        return { success: false, message: "Missing or invalid input" };
    }

    try {
        const res = await db.transaction(async (tx) => {
            const rows = await tx.select().from(blogComments).where(eq(blogComments.id, commentId));
            if (!rows || rows.length === 0) {
                return { success: false, message: "Comment not found" } as ActionResult;
            }
            const comment = rows[0];
            if (comment.userEmail !== userEmail) {
                return { success: false, message: "Permission denied: not the comment author" } as ActionResult;
            }

            const [updated] = await tx
                .update(blogComments)
                .set({ content: content.trim(), updatedAt: new Date() })
                .where(eq(blogComments.id, commentId))
                .returning();

            return {
                success: true,
                message: "Comment updated",
                data: updated,
            } as ActionResult;
        });

        return res;
    } catch (err) {
        console.error("editCommentById error:", err);
        return { success: false, message: (err as Error).message ?? "Failed to update comment" };
    }
}

export async function deleteCommentById(commentId: string, userEmail: string): Promise<ActionResult> {
    if (!commentId || !userEmail) {
        return { success: false, message: "Missing commentId or userEmail" };
    }

    try {
        const res = await db.transaction(async (tx) => {
            const rows = await tx.select().from(blogComments).where(eq(blogComments.id, commentId));
            if (!rows || rows.length === 0) {
                return { success: false, message: "Comment not found" } as ActionResult;
            }
            const comment = rows[0];
            if (comment.userEmail !== userEmail) {
                return { success: false, message: "Permission denied: not the comment author" } as ActionResult;
            }

            const publishedId = comment.blogId;

            await tx.delete(blogComments).where(eq(blogComments.id, commentId));

            const remaining = await tx.select().from(blogComments).where(eq(blogComments.blogId, publishedId));
            const commentsCount = remaining.length;
            await tx.update(publishedBlogs).set({ commentsCount }).where(eq(publishedBlogs.id, publishedId));

            return {
                success: true,
                message: "Comment deleted",
                commentsCount,
            } as ActionResult;
        });

        return res;
    } catch (err) {
        console.error("deleteCommentById error:", err);
        return { success: false, message: (err as Error).message ?? "Failed to delete comment" };
    }
}
