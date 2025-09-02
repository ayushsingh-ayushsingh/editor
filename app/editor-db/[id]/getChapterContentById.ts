'use server';

import { db } from "@/db/drizzle";
import { chapters, chapterContent } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getChapterContentById(chapterId: string) {
    try {
        const [result] = await db
            .select({
                heading: chapters.heading,
                email: chapters.email,
                author: chapterContent.author,
                summary: chapterContent.summary,
                content: chapterContent.content,
                parsed: chapterContent.parsed,
                date: chapterContent.date,
                tags: chapterContent.tags,
                createdAt: chapterContent.createdAt,
                updatedAt: chapterContent.updatedAt,
            })
            .from(chapterContent)
            .innerJoin(chapters, eq(chapterContent.chapterId, chapters.id))
            .where(eq(chapterContent.chapterId, chapterId))
            .limit(1);

        return result || null;
    } catch (error) {
        console.error("Error fetching full chapter content:", error);
        return null;
    }
}
