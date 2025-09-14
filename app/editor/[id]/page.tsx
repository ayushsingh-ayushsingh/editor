import ApiDialogTextEditor from "./apiDialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    if (!id) {
        redirect("/editor");
    }

    return (
        <div className="my-6">
            <ApiDialogTextEditor
                userEmail={session.user.email}
                userName={session.user.name}
                id={id}
            />
        </div>
    );
}
