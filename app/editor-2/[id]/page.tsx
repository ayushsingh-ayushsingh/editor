"use client";

import ApiDialogTextEditor from "./apiDialog";
import getSession from "./getSession";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function Page() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const session = await getSession();
            if (!session) {
                router.push("/login");
                return;
            }
            setName(session.user.name);
            setEmail(session.user.email);
        })();
    }, [router]);

    const params = useParams();
    const id = params.id;

    return (
        <div className="my-6">
            <ApiDialogTextEditor userEmail={email} userName={name} id={id?.toString() || ""} />
        </div>
    );
}
