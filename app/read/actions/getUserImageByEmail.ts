"use server";

import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserImageByEmail(email: string) {
    try {
        const userImageData = await db.select()
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

        const userImage = userImageData[0].image;

        console.log("User image received by email...");

        return { success: true, message: "Users image received by email", userImage };
    } catch (error) {
        console.log("Could not get users image by email", error);
        return { success: false, message: "Could not get users image by email", userImage: "" };
    }
}
