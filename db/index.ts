import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { usersBlogs, blog as blogContent } from "@/db/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
    // const result = await db.select()
    //     .from(blogContent)
    //     .where(eq(blogContent.userBlogId, "f521e9d8-fa8a-45ad-8cb5-21fd82cd9704"))
    //     .limit(1);

    // console.log(result);
}

main();
