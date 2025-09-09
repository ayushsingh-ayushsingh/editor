"use server";

import { db } from "@/db/drizzle";
import { blog as blogContent, usersBlogs } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { desc, eq } from "drizzle-orm";
import { getInitialContent, extractPlainTextFromBlocks } from "../initialBlock"
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

function randomName() {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: ' ',
        style: 'lowerCase'
    });
}

export async function createNewBlog(email: string, author: string) {
    try {
        const newBlogId = uuidv4();
        const newContentId = uuidv4();

        const heading = randomName();

        const newUsersBlog: typeof usersBlogs.$inferInsert = {
            id: newBlogId,
            email,
            heading,
        };

        const content = getInitialContent();

        const newBlogContent: typeof blogContent.$inferInsert = {
            id: newContentId,
            userBlogId: newBlogId,
            author,
            email,
            heading,
            content: JSON.stringify(content),
            parsed: extractPlainTextFromBlocks(content),
        };

        await db.insert(usersBlogs).values(newUsersBlog);
        await db.insert(blogContent).values(newBlogContent);

        console.log("New blog created:", heading);

        return { success: true, message: "New Blog Created", newBlogId, newContentId, heading };
    } catch (error) {
        console.error("Failed to create blog:", error);
        return { success: false, message: "Failed to create new blog!" };
    }
}

export async function updateBlogById(id: string, content: string, parsed: string) {
    try {
        await db.update(blogContent).set({
            content,
            parsed,
            updatedAt: new Date()
        }).where(eq(blogContent.userBlogId, id))

        console.log("Blog updated");

        return {
            success: true,
            message: "Blog saved"
        }
    } catch (error) {
        console.error("Failed to update blog:", error);
        return { success: false, message: "Failed to update blog!" };
    }
}
