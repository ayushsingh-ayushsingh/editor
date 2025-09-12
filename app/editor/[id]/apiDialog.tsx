"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Block } from "@blocknote/core";

import { getBlogById } from "../actions/getBlogById";
import { getInitialContent } from "./initialBlock";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpRight } from "lucide-react";

const Editor = dynamic(() => import("./editor"), { ssr: false });

interface DialogProps {
    userName: string;
    userEmail: string;
    id: string;
}

export default function ApiDialogTextEditor({ userName, userEmail, id }: DialogProps) {
    const router = useRouter();

    const [googleApiKey, setGoogleApiKey] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedKey = localStorage.getItem("googleApiKey");
        if (storedKey) {
            setGoogleApiKey(storedKey);
            setOpen(false);
        } else {
            setOpen(true);
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedKey = googleApiKey.trim();
        if (trimmedKey) {
            try {
                localStorage.setItem("googleApiKey", trimmedKey);
                setGoogleApiKey(trimmedKey);
                setOpen(false);
            } catch (err) {
                console.error("Failed to save API key", err);
            }
        }
    };

    // Blog content state
    const [content, setContent] = useState<Block[]>(getInitialContent());
    const [parsedContent, setParsedContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchBlog = async () => {
            try {
                const blog = await getBlogById(id);

                if (!blog?.success || !blog?.blog) {
                    // not found / unauthorized
                    router.replace("/editor");
                    return;
                }

                const blogContent = blog.blog.content || "";
                const blogParsedContent = blog.blog.parsed || "";
                const blogEmail = blog.blog.email || "";

                if (blogEmail !== userEmail) {
                    router.replace("/editor");
                    return;
                }

                if (!mounted) return;

                setContent(blogContent ? JSON.parse(blogContent) : getInitialContent());
                setParsedContent(blogParsedContent || "");
            } catch (err) {
                console.error("Failed to fetch blog", err);
                router.replace("/editor");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void fetchBlog();

        return () => {
            mounted = false;
        };
    }, [id, userEmail, router]);

    if (loading) {
        return <div className="p-4 text-muted-foreground">Loading editor...</div>;
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Google API Key</DialogTitle>
                            <DialogDescription>
                                Add Google API key from{" "}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary mx-1 border-b border-primary pb-0"
                                >
                                    here
                                    <ArrowUpRight className="w-4 h-4 shrink-0 -ml-1" aria-hidden="true" />
                                </a>{" "}
                                to use AI assistant.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="google-api-key">Google API Key</Label>
                                <Input
                                    id="google-api-key"
                                    name="google-api-key"
                                    value={googleApiKey}
                                    onChange={(e) => setGoogleApiKey(e.target.value)}
                                    placeholder="Enter your Google API key"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

            <Editor
                userName={userName}
                userEmail={userEmail}
                googleApiKey={googleApiKey}
                blogId={id}
                initialContent={content}
                initialParsedContent={parsedContent}
            />
        </div>
    );
}
