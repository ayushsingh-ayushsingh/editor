'use server';

import { db } from "@/db/drizzle";
import { chapters } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getChaptersByUser(email: string) {
    try {
        const result = await db
            .select({
                id: chapters.id,
                heading: chapters.heading,
                createdAt: chapters.createdAt,
                updatedAt: chapters.updatedAt
            })
            .from(chapters)
            .where(eq(chapters.email, email))
            .orderBy(chapters.updatedAt);

        return result;
    } catch (error) {
        console.error("Failed to fetch chapters:", error);
        return [];
    }
}
