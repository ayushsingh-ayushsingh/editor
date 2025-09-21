// app/read/actions/reactions.ts  (or wherever your file lives)
"use server";

import { db } from "@/db/drizzle";
import { publishedBlogs, blogLikes, blogDislikes } from "@/db/schema/publish";
import { eq, and } from "drizzle-orm";

type ReactionResult = {
    success: boolean;
    message?: string;
    action?: "liked" | "unliked" | "disliked" | "undisliked";
    likesCount?: number;
    dislikesCount?: number | null;
};

function isRelationNotFound(err: any) {
    // Postgres relation-not-found typically uses SQLSTATE '42P01'
    return err && (err.code === "42P01" || (err?.message && err.message.includes("does not exist")));
}

export async function likePublishedBlog(publishedId: string, userEmail: string): Promise<ReactionResult> {
    if (!publishedId || !userEmail) return { success: false, message: "Missing publishedId or userEmail" };

    try {
        const res = await db.transaction(async (tx) => {
            // ensure published exists
            const pubRows = await tx.select().from(publishedBlogs).where(eq(publishedBlogs.id, publishedId));
            if (!pubRows || pubRows.length === 0) {
                return { success: false, message: "Published post not found" } as ReactionResult;
            }

            // check existing like (use and(...) to combine conditions)
            const existingLike = await tx
                .select()
                .from(blogLikes)
                .where(and(eq(blogLikes.blogId, publishedId), eq(blogLikes.userEmail, userEmail)));

            if (existingLike && existingLike.length > 0) {
                // remove like
                await tx.delete(blogLikes).where(and(eq(blogLikes.blogId, publishedId), eq(blogLikes.userEmail, userEmail)));
            } else {
                // insert like
                await tx.insert(blogLikes).values({
                    blogId: publishedId,
                    userEmail,
                    createdAt: new Date(),
                });

                // remove existing dislike if any (also use and(...))
                const existingDislike = await tx
                    .select()
                    .from(blogDislikes)
                    .where(and(eq(blogDislikes.blogId, publishedId), eq(blogDislikes.userEmail, userEmail)));

                if (existingDislike && existingDislike.length > 0) {
                    await tx.delete(blogDislikes).where(and(eq(blogDislikes.blogId, publishedId), eq(blogDislikes.userEmail, userEmail)));
                }
            }

            // recompute counts
            const likesRows = await tx.select().from(blogLikes).where(eq(blogLikes.blogId, publishedId));
            const likesCount = likesRows.length;
            await tx.update(publishedBlogs).set({ likesCount }).where(eq(publishedBlogs.id, publishedId));

            const disRows = await tx.select().from(blogDislikes).where(eq(blogDislikes.blogId, publishedId));
            const dislikesCount = disRows.length;
            try {
                await tx.update(publishedBlogs).set({ dislikesCount }).where(eq(publishedBlogs.id, publishedId));
            } catch {
                // if your published table doesn't have dislikesCount, ignore
            }

            const action = existingLike && existingLike.length > 0 ? "unliked" : "liked";

            return {
                success: true,
                message: action === "liked" ? "Blog liked" : "Like removed",
                action,
                likesCount,
                dislikesCount,
            } as ReactionResult;
        });

        return res;
    } catch (err) {
        console.error("likePublishedBlog error:", err);

        if (isRelationNotFound(err)) {
            return {
                success: false,
                message:
                    "Database error: one or more reaction tables (blog_likes / blog_dislikes) do not exist. Run your migrations / check schema.",
            };
        }

        return { success: false, message: (err as Error).message ?? "Failed to like/unlike" };
    }
}

export async function dislikePublishedBlog(publishedId: string, userEmail: string): Promise<ReactionResult> {
    if (!publishedId || !userEmail) return { success: false, message: "Missing publishedId or userEmail" };

    try {
        const res = await db.transaction(async (tx) => {
            const pubRows = await tx.select().from(publishedBlogs).where(eq(publishedBlogs.id, publishedId));
            if (!pubRows || pubRows.length === 0) {
                return { success: false, message: "Published post not found" } as ReactionResult;
            }

            // check existing dislike
            const existingDislike = await tx
                .select()
                .from(blogDislikes)
                .where(and(eq(blogDislikes.blogId, publishedId), eq(blogDislikes.userEmail, userEmail)));

            if (existingDislike && existingDislike.length > 0) {
                // remove dislike
                await tx.delete(blogDislikes).where(and(eq(blogDislikes.blogId, publishedId), eq(blogDislikes.userEmail, userEmail)));
            } else {
                // insert dislike
                await tx.insert(blogDislikes).values({
                    blogId: publishedId,
                    userEmail,
                    createdAt: new Date(),
                });

                // remove like if present
                const existingLike = await tx
                    .select()
                    .from(blogLikes)
                    .where(and(eq(blogLikes.blogId, publishedId), eq(blogLikes.userEmail, userEmail)));

                if (existingLike && existingLike.length > 0) {
                    await tx.delete(blogLikes).where(and(eq(blogLikes.blogId, publishedId), eq(blogLikes.userEmail, userEmail)));
                }
            }

            // recompute counts
            const likesRows = await tx.select().from(blogLikes).where(eq(blogLikes.blogId, publishedId));
            const likesCount = likesRows.length;
            await tx.update(publishedBlogs).set({ likesCount }).where(eq(publishedBlogs.id, publishedId));

            const disRows = await tx.select().from(blogDislikes).where(eq(blogDislikes.blogId, publishedId));
            const dislikesCount = disRows.length;
            try {
                await tx.update(publishedBlogs).set({ dislikesCount }).where(eq(publishedBlogs.id, publishedId));
            } catch {
                // ignore if column not present
            }

            const action = existingDislike && existingDislike.length > 0 ? "undisliked" : "disliked";

            return {
                success: true,
                message: action === "disliked" ? "Blog disliked" : "Dislike removed",
                action,
                likesCount,
                dislikesCount,
            } as ReactionResult;
        });

        return res;
    } catch (err) {
        console.error("dislikePublishedBlog error:", err);

        if (isRelationNotFound(err)) {
            return {
                success: false,
                message:
                    "Database error: one or more reaction tables (blog_likes / blog_dislikes) do not exist. Run your migrations / check schema.",
            };
        }

        return { success: false, message: (err as Error).message ?? "Failed to dislike/undislike" };
    }
}
