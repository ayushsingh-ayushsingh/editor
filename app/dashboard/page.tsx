import LogoutButton from "@/components/layouts/logout-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Signature } from "lucide-react";
import Link from "next/link";
import Background from "./background";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex gap-4 items-center justify-center h-[100vh]">
            <Background />
            <div className="text-center">
                <h1 className="text-3xl text-shadow-background/50 text-shadow-md">Welcome! {session.user.name}</h1>
                <div className="flex gap-2 p-4 justify-center">
                    <LogoutButton />
                    <Button asChild>
                        <Link href="/">
                            Home<Home className='size-4' />
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/editor">
                            Write<Signature className='size-4' />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
