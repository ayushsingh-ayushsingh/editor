'use server';

import { db } from '@/db/drizzle';
import { pageData, tags, pageTags } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { Block } from "@blocknote/core";

interface PageDataInput {
    id: string;
    heading: string;
    author: string;
    email: string;
    summary?: string;
    content: Block[];
    parsedContent: string;
    date: string;
    tags: string[];
}

export async function savePageData(input: PageDataInput) {
    const {
        id,
        heading,
        author,
        email,
        summary,
        parsedContent,
        content,
        date,
        tags: inputTags,
    } = input;

    const now = new Date();

    try {
        // Insert new page
        await db.insert(pageData).values({
            id,
            heading,
            author,
            email,
            summary,
            parsedContent,
            content,
            date,
            createdAt: now,
            updatedAt: now,
        });

        // Tags logic (inside try to catch errors too)
        try {
            const tagRecords = await Promise.all(
                inputTags.map(async (tagText) => {
                    const existingTag = await db
                        .select()
                        .from(tags)
                        .where(eq(tags.tag, tagText))
                        .limit(1);

                    if (existingTag.length > 0) {
                        return existingTag[0];
                    } else {
                        const newTag = { id: uuidv4(), tag: tagText };
                        await db.insert(tags).values(newTag);
                        return newTag;
                    }
                })
            );

            // Replace pageTags
            await db.delete(pageTags).where(eq(pageTags.pageId, id));

            await db.insert(pageTags).values(
                tagRecords.map((tag) => ({
                    id: uuidv4(),
                    pageId: id,
                    tagId: tag.id,
                }))
            );
        } catch (tagError) {
            console.error('Failed to save tags:', tagError);
            throw new Error('Failed to save tags for the page.');
        }
    } catch (err: any) {
        console.error('Failed to save page data:', err);

        if (err.message.includes('not authorized')) {
            throw new Error('Permission denied: You are not the author of this page.');
        }

        if (err.code === '23505') {
            // Unique constraint violation
            throw new Error('Page with similar content already exists.');
        }

        throw new Error('Unexpected error while saving page data.');
    }
}
