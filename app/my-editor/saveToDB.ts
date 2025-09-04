'use server';

import { db } from '@/db/drizzle';
import {
    chaptersExample,
    chapterContentExample,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

interface PageDataInput {
    id: string;       // content id
    chapterId: string; // parent chapter id
    heading: string;
    author: string;
    email: string;
    content: string;   // JSON string or text
    parsed: string;
    date: string;
}

export async function savePageData(input: PageDataInput) {
    const {
        id,
        chapterId,
        heading,
        author,
        email,
        content,
        parsed,
        date,
    } = input;

    const now = new Date();

    try {
        // 1. Ensure chapter exists (upsert based on heading/email)
        const existingChapter = await db
            .select()
            .from(chaptersExample)
            .where(eq(chaptersExample.heading, heading))
            .limit(1);

        let finalChapterId = chapterId;
        if (existingChapter.length === 0) {
            const newChapterId = uuidv4();
            await db.insert(chaptersExample).values({
                id: newChapterId,
                heading,
                email,
                createdAt: now,
                updatedAt: now,
            });
            finalChapterId = newChapterId;
        } else {
            finalChapterId = existingChapter[0].id;
        }

        // 2. Upsert content (if same id exists, update, otherwise insert)
        const existingContent = await db
            .select()
            .from(chapterContentExample)
            .where(eq(chapterContentExample.id, id))
            .limit(1);

        if (existingContent.length > 0) {
            await db
                .update(chapterContentExample)
                .set({
                    author,
                    content: JSON.parse(content),
                    parsed,
                    date,
                    updatedAt: now,
                })
                .where(eq(chapterContentExample.id, id));
        } else {
            await db.insert(chapterContentExample).values({
                id: id || uuidv4(),
                chapterId: finalChapterId,
                author,
                content: JSON.parse(content),
                parsed,
                date,
                createdAt: now,
                updatedAt: now,
            });
        }

        return { success: true, chapterId: finalChapterId, contentId: id };
    } catch (err: any) {
        console.error('Failed to save page data:', err);

        if (err.message?.includes('not authorized')) {
            throw new Error('Permission denied: You are not the author of this page.');
        }
        if (err.code === '23505') {
            throw new Error('Page with similar content already exists.');
        }
        throw new Error('Unexpected error while saving page data.');
    }
}
