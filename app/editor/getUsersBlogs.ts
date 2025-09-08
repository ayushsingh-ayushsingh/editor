"use server";

import { db } from "@/db/drizzle";
import { usersBlogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getBlogsByEmail(email: string) {
    try {
        const blogsList = await db.select()
            .from(usersBlogs)
            .where(eq(usersBlogs.email, email))
            .orderBy(desc(usersBlogs.updatedAt));

        console.log("Blog list served");

        return blogsList;
    } catch (error) {
        console.log("Could not get blogs by email", error);
        return [];
    }
}

export async function deleteBlogById(id: string) {
    try {
        await db.delete(usersBlogs).where(eq(usersBlogs.id, id));

        console.log(`Blog with id: ${id} deleted...`);

        return { success: true, message: "Deleted blog successfully" };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: "Failed to delete the blog!"
        }
    }
}
