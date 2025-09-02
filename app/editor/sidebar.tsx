'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { PanelLeftOpen } from "lucide-react";
import { getChaptersByUser } from "./getChaptersByUser";
import Link from "next/link";

type Chapter = {
    id: string;
    heading: string;
    createdAt: Date;
    updatedAt: Date;
};

export function SheetSidebar({ userEmail }: { userEmail: string }) {
    const [chapters, setChapters] = useState<Chapter[]>([]);

    useEffect(() => {
        async function fetchChapters() {
            const data = await getChaptersByUser(userEmail);
            setChapters(data);
        }

        fetchChapters();
    }, [userEmail]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="secondary" size="icon">
                    <PanelLeftOpen />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Your Creations</SheetTitle>
                    <SheetDescription>Your chapters are listed here.</SheetDescription>
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto max-h-[60vh]">
                    <div className="grid gap-3">
                        {chapters.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No chapters found.</p>
                        ) : (
                            <ol className="space-y-2">
                                {chapters.map((chapter) => (
                                    <li key={chapter.id}>
                                        <Link
                                            href={`/editor-db/${chapter.id}`}
                                            onClick={() => {
                                                console.log("Clicked chapter:", chapter.id);
                                            }}
                                            className="text-left text-sm hover:underline"
                                        >
                                            {chapter.heading}
                                        </Link>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
