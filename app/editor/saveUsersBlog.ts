"use server";

import { db } from "@/db/drizzle";
import { blog as blogContent, usersBlogs } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { content } from "./initialBlock"
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

        const newBlogContent: typeof blogContent.$inferInsert = {
            id: newContentId,
            userBlogId: newBlogId,
            author,
            email,
            heading,
            content: JSON.stringify(content),
            parsed: "New Page",
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

// export async function saveUsersBlog(input: SaveBlogInput) {
//     return await db.transaction(async (tx) => {
//         // 1. Check if userBlog already exists for this email + heading
//         let [existingUserBlog] = await tx
//             .select()
//             .from(usersBlogs)
//             .where(eq(usersBlogs.email, input.email));

//         let userBlogId: string;

//         if (existingUserBlog) {
//             // Update the heading & updatedAt
//             userBlogId = existingUserBlog.id;
//             await tx
//                 .update(usersBlogs)
//                 .set({
//                     heading: input.heading,
//                     updatedAt: new Date(),
//                 })
//                 .where(eq(usersBlogs.id, userBlogId));
//         } else {
//             // Create new usersBlog
//             userBlogId = uuidv4();
//             await tx.insert(usersBlogs).values({
//                 id: userBlogId,
//                 email: input.email,
//                 heading: input.heading,
//             });
//         }

//         // 2. Insert new blog entry
//         const blogId = uuidv4();
//         await tx.insert(blog).values({
//             id: blogId,
//             userBlogId,
//             author: input.author,
//             email: input.email,
//             heading: input.heading,
//             content: input.content,
//             parsed: input.parsed,
//         });

//         return { userBlogId, blogId };
//     });
// }
