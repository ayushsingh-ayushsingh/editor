'use server';

import { db } from '@/db/drizzle';
import { chapters, chapterContent } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface PageDataInput {
    heading: string;
    author: string;
    email: string;
    summary: string;
    content: string;
    parsed: string;
    date: string;
    tags: string;
}

export async function saveBlog(input: PageDataInput) {
    const {
        heading,
        author,
        email,
        summary,
        content,
        parsed,
        date,
        tags,
    } = input;

    const now = new Date();

    try {
        // Check if heading already exists (enforce unique heading in chapters)
        const existing = await db
            .select({ id: chapters.id })
            .from(chapters)
            .where(eq(chapters.heading, heading))
            .limit(1);

        if (existing.length > 0) {
            return {
                success: false,
                message: `The heading "${heading}" is already in use.`,
            };
        }

        // Insert into `chapters` first (returns ID)
        const [chapter] = await db
            .insert(chapters)
            .values({
                heading,
                email,
                createdAt: now,
            })
            .returning({ id: chapters.id });

        // Insert full content linked to chapter
        await db.insert(chapterContent).values({
            chapterId: chapter.id,
            author,
            summary,
            content,
            parsed,
            date,
            tags,
            createdAt: now,
            updatedAt: now,
        });

        return {
            success: true,
            message: 'Blog saved successfully',
        };
    } catch (err: any) {
        console.error('Failed to save blog:', err);

        if (err.code === '23505') {
            return {
                success: false,
                message: 'A unique constraint was violated.',
            };
        }

        return {
            success: false,
            message: `Unexpected error occurred: ${err.message || err}`,
        };
    }
}
