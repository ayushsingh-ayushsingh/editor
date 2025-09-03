"use server";

import { db } from "@/db/drizzle";
import { chapters, chapterContent } from "@/db/schema";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

const formSchema = z.object({
    chapter: z.string().min(1),
    author: z.string().min(1),
    date: z.string().min(1),
    email: z.string().email(),
    heading: z.string().min(1),
    content: z.string().min(1),
    parsed: z.string(),
    summary: z.string().optional(),
    tags: z.string().optional(),
});

export async function saveChapterContent(rawData: unknown) {
    const parsed = formSchema.safeParse(rawData);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.flatten(),
        };
    }

    const {
        chapter,
        author,
        date,
        email,
        heading,
        content,
        parsed: parsedContent,
        summary,
        tags,
    } = parsed.data;

    const existingChapter = await db
        .select({ id: chapters.id })
        .from(chapters)
        .where(eq(chapters.heading, heading))
        .limit(1);

    let chapterId: string;

    if (existingChapter.length > 0) {
        chapterId = existingChapter[0].id;
    } else {
        const inserted = await db
            .insert(chapters)
            .values({ heading, email })
            .returning({ id: chapters.id });
        chapterId = inserted[0].id;
    }

    const existingContent = await db
        .select({ id: chapterContent.id })
        .from(chapterContent)
        .where(eq(chapterContent.chapterId, chapterId))
        .orderBy(desc(chapterContent.createdAt))
        .limit(1);

    if (existingContent.length > 0) {
        await db
            .update(chapterContent)
            .set({
                author,
                date,
                tags: tags ?? "",
                content: { text: content },
                parsed: parsedContent,
                summary: summary ?? "",
                updatedAt: new Date(),
            })
            .where(eq(chapterContent.id, existingContent[0].id));
    } else {
        await db.insert(chapterContent).values({
            chapterId,
            author,
            date,
            tags: tags ?? "",
            content: { text: content },
            parsed: parsedContent,
            summary: summary ?? "",
        });
    }

    return { success: true, message: "Content saved successfully" };
}
