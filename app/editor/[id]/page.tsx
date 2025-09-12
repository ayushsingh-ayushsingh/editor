import ApiDialogTextEditor from "./apiDialog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const id = params?.id;
    if (!id) {
        redirect("/editor");
    }

    return (
        <div className="my-6">
            <ApiDialogTextEditor userEmail={session.user.email} userName={session.user.name} id={id} />
        </div>
    );
}
