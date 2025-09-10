"use server";

import { db } from "@/db/drizzle";
import { blog as blogContent } from "@/db/schema";
import { eq } from "drizzle-orm";

type GetBlogResult = {
    success: boolean;
    blog?: typeof blogContent.$inferSelect;
    message?: string;
};

export async function getBlogById(id: string): Promise<GetBlogResult> {
    try {
        const result = await db.select()
            .from(blogContent)
            .where(eq(blogContent.userBlogId, id))
            .limit(1);

        if (!result.length) {
            return { success: false, message: "Chapter not found" };
        }

        return { success: true, message: "Chapter received", blog: result[0] };
    } catch (error) {
        console.error("Could not get blog by id", error);
        return { success: false, message: "Database error" };
    }
}