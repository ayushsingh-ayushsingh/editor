import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createNewBlog } from "./actions/saveUsersBlog";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const res = await createNewBlog(session.user.email, session.user.name);

    if (!res?.success || !res?.newBlogId) {
        redirect("/editor");
    }

    const newId = res.newBlogId;
    redirect(`/editor/${newId}`);
}
