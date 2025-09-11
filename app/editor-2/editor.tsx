"use client";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { codeBlock } from "@blocknote/code-block";
import { ChevronUp, Trash2, CircleCheck, LoaderCircle } from "lucide-react";
import { createNewBlog, updateBlogById } from "./actions/saveUsersBlog";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useMemo } from "react";
import debounce from 'lodash.debounce';

import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from "@blocknote/mantine";
import '@blocknote/mantine/style.css';
import "./css/styles.css";
import "./css/codeStyles.css"
import {
    FormattingToolbar,
    FormattingToolbarController,
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    getFormattingToolbarItems,
    useCreateBlockNote,
} from '@blocknote/react';
import {
    AIMenuController,
    AIToolbarButton,
    createAIExtension,
    getAISlashMenuItems,
} from '@blocknote/xl-ai';
import '@blocknote/xl-ai/style.css';
import { en as aiEn } from '@blocknote/xl-ai/locales';

import React from 'react'
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ScrollArea } from "@/components/ui/scroll-area"
import { extractPlainTextFromBlocks } from "./initialBlock";
import { getInitialContent } from "./initialBlock";

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { getBlogsByEmail, deleteBlogById } from "./actions/getUsersBlogs";
import { getBlogById } from "./actions/getBlogById";

interface EditorProps {
    userName: string;
    userEmail: string;
    googleApiKey: string;
}

function FormattingToolbarWithAI() {
    return (
        <FormattingToolbarController
            formattingToolbar={() => (
                <FormattingToolbar>
                    {...getFormattingToolbarItems()}
                    <AIToolbarButton />
                </FormattingToolbar>
            )}
        />
    );
}

function SuggestionMenuWithAI(props: {
    editor: BlockNoteEditor<any, any, any>;
}) {
    return (
        <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
                filterSuggestionItems(
                    [
                        ...getDefaultReactSlashMenuItems(props.editor),
                        ...getAISlashMenuItems(props.editor),
                    ],
                    query
                )
            }
        />
    );
}

export default function Editor({ userName, userEmail, googleApiKey }: EditorProps) {
    // Page content

    const locale = en;

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [id, setId] = useState<string | null>(null);

    const lastSavedRef = React.useRef<string>("");

    useEffect(() => {
        const initialId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
        setId(initialId);
    }, []);

    useEffect(() => {
        if (saveStatus === "saved") {
            const t = setTimeout(() => setSaveStatus("idle"), 3500);
            return () => clearTimeout(t);
        }
    }, [saveStatus]);

    const [blocks, setBlocks] = useState<Block[]>(() => {
        try {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("pageContent");
                let parsed: Block[] | null = null;
                try {
                    parsed = stored ? JSON.parse(stored) : null;
                } catch (e) {
                    console.error("Invalid JSON in blog content", stored);
                    parsed = getInitialContent();
                }
                return Array.isArray(parsed) ? parsed : getInitialContent();
            }
        } catch {
            return getInitialContent();
        }
        return getInitialContent();
    });

    useEffect(() => {
        if (blocks.length > 0) {
            lastSavedRef.current = JSON.stringify(blocks);
            setSaveStatus("idle");
        }
    }, [blocks]);

    const editor = useCreateBlockNote({
        codeBlock,
        initialContent: blocks,
        dictionary: {
            ...locale,
            placeholders: {
                ...locale.placeholders,
                emptyDocument: "Render your thoughts here...",
                default: "...",
                heading: "...",
            },
            ai: aiEn
        },
        uploadFile,
        extensions: [
            createAIExtension({
                model: createGoogleGenerativeAI({
                    // apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                    apiKey: googleApiKey || "",
                })("gemini-2.5-flash"),
            }),
        ],
    });

    // Parsed Content

    const [parsedContent, setParsedContent] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("parsedContent") || "";
        }
        return "";
    });

    const [heading, setHeading] = useState(() => {
        return parsedContent && parsedContent.trim().length > 0
            ? parsedContent.replace(/\s+/g, " ").trim().substring(0, 50)
            : "Untitled";
    });

    const lastHeadingRef = React.useRef(heading);

    function computeHeading(text: string) {
        return text && text.trim().length > 0
            ? text.replace(/\s+/g, " ").trim().substring(0, 50)
            : "Untitled";
    }

    const debouncedHeadingUpdate = useMemo(
        () =>
            debounce(async (plainText: string, blogId: string) => {
                const newHeading = computeHeading(plainText);

                if (newHeading !== lastHeadingRef.current) {
                    setHeading(newHeading);
                    lastHeadingRef.current = newHeading;

                    const res = await updateBlogById(blogId, newHeading, JSON.stringify(editor.document), plainText);
                    if (res?.success) {
                        fetchBlogs();
                    }
                }
            }, 3000),
        [editor]
    );

    useEffect(() => {
        if (!id) return;
        debouncedHeadingUpdate(parsedContent, id);
    }, [parsedContent, id]);

    useEffect(() => {
        const newHeading =
            parsedContent && parsedContent.trim().length > 0
                ? parsedContent.replace(/\s+/g, " ").trim().substring(0, 50)
                : "Untitled";

        if (newHeading !== heading) {
            setHeading(newHeading);
        }
    }, [parsedContent, heading]);

    const debouncedHandleChange = useMemo(
        () =>
            debounce(async () => {
                const currentContent = editor.document;
                const currentString = JSON.stringify(currentContent);

                if (currentString === lastSavedRef.current) {
                    setSaveStatus("idle");
                    return;
                }

                const plainText = extractPlainTextFromBlocks(currentContent);
                setBlocks(currentContent);
                setParsedContent(plainText);
                localStorage.setItem("pageContent", currentString);
                localStorage.setItem("parsedContent", plainText);

                const blogId = localStorage.getItem("id");
                if (!blogId) {
                    setSaveStatus("idle");
                    toast.error("Cannot get blog id");
                    return;
                }

                const res = await updateBlogById(blogId, heading, currentString, plainText);
                if (res?.success) {
                    lastSavedRef.current = currentString;
                    setSaveStatus("saved");
                    toast.success(res.message);
                } else {
                    setSaveStatus("idle");
                    if (res?.message) toast.error(res.message);
                }
            }, 10000),
        [editor, heading, setBlocks]
    );

    useEffect(() => {
        return () => debouncedHandleChange.cancel();
    }, [debouncedHandleChange]);

    const [blogsList, setblogsList] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    async function fetchBlogs() {
        const list = await getBlogsByEmail(userEmail);
        setblogsList(list.blogsList);
    }

    useEffect(() => {
        fetchBlogs();
    }, [userEmail]);

    async function handleGetBlogById(id: string) {
        setIsDrawerOpen(false);
        const res = await getBlogById(id);

        console.log(res);

        res.success
            ? toast.success(res.message)
            : toast.error(res.message);

        const resBlog = res.blog;
        const stored = resBlog?.content;
        const parsed = stored ? JSON.parse(stored) : null;

        const currentContent = Array.isArray(parsed) ? parsed : getInitialContent();
        const plainText = extractPlainTextFromBlocks(currentContent);

        localStorage.setItem("pageContent", JSON.stringify(currentContent));
        localStorage.setItem("parsedContent", plainText);

        setParsedContent(plainText);
        setBlocks(currentContent);

        localStorage.setItem("id", id);
        setId(id);

        lastSavedRef.current = JSON.stringify(currentContent);
        setSaveStatus("idle");
    }

    async function handleCreateNewBlog() {
        setIsDrawerOpen(false);

        const newBlogRes = await createNewBlog(userEmail, userName);

        if (newBlogRes.success) {
            const newBlogId = newBlogRes.newBlogId;
            setId(newBlogId || "");
            localStorage.setItem("id", newBlogId || "");

            const res = await getBlogById(newBlogId!);
            if (res.success && res.blog?.content) {
                const stored = res.blog.content;
                const parsed = stored ? JSON.parse(stored) : null;
                const currentContent = Array.isArray(parsed) ? parsed : getInitialContent();

                const plainText = extractPlainTextFromBlocks(currentContent);

                setBlocks(currentContent);
                setParsedContent(plainText);
                localStorage.setItem("pageContent", JSON.stringify(currentContent));
                localStorage.setItem("parsedContent", plainText);
                lastSavedRef.current = JSON.stringify(currentContent);

                toast.success("New blog created and content loaded!");
            } else {
                setBlocks(getInitialContent());
                setParsedContent("");
                lastSavedRef.current = JSON.stringify(getInitialContent());
                localStorage.setItem("pageContent", JSON.stringify(getInitialContent()));
                localStorage.setItem("parsedContent", "");
                toast.success("New blog created!");
            }
        } else {
            toast.error(newBlogRes.message);
        }
        fetchBlogs();
    }

    const hasCreatedInitialBlog = React.useRef(false);

    useEffect(() => {
        if (blogsList.length === 0 && !hasCreatedInitialBlog.current) {
            hasCreatedInitialBlog.current = true;
            (async () => {
                await handleCreateNewBlog();
            })();
        }
    }, [blogsList.length]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();

                if (!id) {
                    toast.error("No blog selected to save");
                    return;
                }

                const currentContent = editor.document;
                const currentString = JSON.stringify(currentContent);
                const plainText = extractPlainTextFromBlocks(currentContent);

                updateBlogById(id, computeHeading(plainText), currentString, plainText).then((res) => {
                    if (res?.success) {
                        const newHeading = computeHeading(plainText);
                        setHeading(newHeading);
                        lastHeadingRef.current = newHeading;
                        fetchBlogs();

                        lastSavedRef.current = currentString;
                        setSaveStatus("saved");
                        localStorage.setItem("pageContent", currentString);
                        localStorage.setItem("parsedContent", plainText);
                        toast.success("Blog saved");
                    } else {
                        setSaveStatus("idle");
                        toast.error(res?.message || "Failed to save blog");
                    }
                });
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [editor, id]);

    useEffect(() => {
        if (editor && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
            lastSavedRef.current = JSON.stringify(blocks);
            setSaveStatus("idle");
        }
    }, [blocks, editor]);

    useEffect(() => {
        if (!id) return;
        debouncedHeadingUpdate(parsedContent, id);
    }, [parsedContent, id]);

    return (
        <div className="max-w-5xl w-full mx-auto">
            <span className="fixed top-2 right-2 text-xs">
                <span className="fixed top-2 right-2 text-xs">
                    {saveStatus === "saving" && (
                        <Tooltip>
                            <TooltipTrigger>
                                <LoaderCircle className="animate-spin" size={16} />
                            </TooltipTrigger>
                            <TooltipContent><p>Saving...</p></TooltipContent>
                        </Tooltip>
                    )}
                    {saveStatus === "saved" && (
                        <Tooltip>
                            <TooltipTrigger>
                                <CircleCheck className="text-primary" size={16} />
                            </TooltipTrigger>
                            <TooltipContent><p>Saved</p></TooltipContent>
                        </Tooltip>
                    )}
                </span>
            </span>
            <div className='min-h-[80vh] mb-8'>
                <div className="max-w-5xl mx-auto pb-[33vh]">
                    <div className="overflow-x-hidden">
                        <BlockNoteView
                            className="pl-0 py-4 -mx-10"
                            spellCheck="false"
                            theme="light"
                            editor={editor}
                            onChange={() => {
                                const currentString = JSON.stringify(editor.document);
                                if (currentString !== lastSavedRef.current) {
                                    if (saveStatus !== "saving") setSaveStatus("saving");
                                    debouncedHandleChange();
                                }
                            }}
                            data-theming-css-variables
                            data-changing-font
                            formattingToolbar={false}
                            slashMenu={false}
                        >
                            <AIMenuController />
                            <FormattingToolbarWithAI />
                            <SuggestionMenuWithAI editor={editor} />
                        </BlockNoteView>
                    </div>
                </div>
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <span className="mx-auto fixed bottom-2 left-0 flex items-center justify-center rounded-md right-0 size-9 hover:bg-accent">
                        <ChevronUp className="size-6 hover:bg-accent w-5 h-5 z-50" />
                    </span>
                </DrawerTrigger>
                <DrawerContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className="focus-visible:outline-none focus-visible:ring-0 focus:outline-none focus:ring-0"
                >
                    <DrawerHeader>
                        <DrawerTitle className="text-lg font-medium">Your Creations, {userName}</DrawerTitle>
                        <DrawerDescription className="sr-only">
                            A list of all the creations of {userName} - {userEmail}
                        </DrawerDescription>
                        <ScrollArea className="h-[33vh] max-w-md w-full mx-auto rounded-md">
                            <div className="px-4 flex-col">
                                {
                                    blogsList.map((blog, index) => (
                                        <div key={index} className="-ml-2">
                                            <div className="max-w-md w-full flex items-center gap-2 p-0.5 m-1 mx-auto rounded-lg hover:bg-accent transition">
                                                <Button
                                                    variant="ghost"
                                                    className={`flex-1 justify-start text-md truncate overflow-hidden text-ellipsis
                                                    ${blog.id === id ? "underline text-accent-foreground underline-offset-2" : ""}`}
                                                    title={blog.heading}
                                                    onClick={() => {
                                                        handleGetBlogById(blog.id);
                                                    }}
                                                >
                                                    <span className="w-[300px] text-ellipsis truncate text-start sm:w-[150px] md:w-[300px]">
                                                        {blog.heading ? blog.heading.charAt(0).toUpperCase() + blog.heading.slice(1, 30) + "..." : "Untitled"}
                                                    </span>
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 dark:hover:bg-card/80 mr-0.2 hover:bg-card/80"
                                                        >
                                                            <Trash2 className="text-destructive w-4 h-4 sm:w-5 sm:h-5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the chapter - <span className="underline underline-offset-2">
                                                                    {blog.heading ? blog.heading.charAt(0).toUpperCase() + blog.heading.slice(1, 30) + "..." : "Untitled"}
                                                                </span> and remove its data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={async () => {
                                                                    const res = await deleteBlogById(blog.id);
                                                                    if (res.success) {
                                                                        toast.success("Blog deleted successfully");
                                                                        await fetchBlogs();

                                                                        if (blog.id === id) {
                                                                            localStorage.removeItem("id");
                                                                            localStorage.removeItem("pageContent");
                                                                            localStorage.removeItem("parsedContent");
                                                                            await handleCreateNewBlog();
                                                                        }
                                                                    } else {
                                                                        toast.error(res.message);
                                                                        await fetchBlogs();
                                                                    }
                                                                }}
                                                            >
                                                                Continue
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>)
                                    )
                                }
                                <div className="h-[20vh] flex justify-center items-end text-muted-foreground">
                                    {blogsList.length == 0 ?
                                        "You have not created any chapter...!"
                                        :
                                        blogsList.length == 1 ?
                                            `You have created a single chapter.`
                                            :
                                            `You have ${blogsList.length} creations`
                                    }
                                </div>
                            </div>
                        </ScrollArea>
                    </DrawerHeader>
                    <DrawerFooter>
                        <div className="max-w-md w-full mx-auto space-y-2">
                            <Button
                                className="max-w-md w-full p-5"
                                onClick={async () => handleCreateNewBlog()}
                            >
                                Craft New Chapter
                            </Button>
                            <Button
                                variant="outline"
                                className="max-w-md w-full p-5"
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                Close Drawer
                            </Button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
