import { Editor } from "./dynamicEditor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SheetSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <div>
            <div className="fixed top-2 left-2 z-10">
                <SheetSidebar userEmail={session.user.email} />
            </div>
            <div className="text-center w-full flex justify-center items-center text-accent-foreground/60 p-2 h-14 gap-4">
                <span className="underline underline-offset-2 truncate w-[150px]">
                    Chapter - 1
                </span>
            </div>
            <Editor userName={session.user.name} userEmail={session.user.email} />
        </div>
    )
}
