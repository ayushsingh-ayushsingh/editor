import { Editor } from "./dynamicEditor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Bokor } from "next/font/google";

const bokorFont = Bokor({
    subsets: ["latin"],
    weight: "400",
})

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="my-6">
            <div className="w-full text-center text-9xl">
                <span className={`${bokorFont.className}`}>
                    Ayush
                </span>
            </div>
            <Editor userName={session.user.name} userEmail={session.user.email} />
        </div>
    )
}
