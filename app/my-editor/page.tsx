// import { Editor } from "./dynamicEditor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Example } from "./example";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div>
            {/* <Editor userName={session.user.name} userEmail={session.user.email} /> */}
            <Example />
        </div>
    )
}
