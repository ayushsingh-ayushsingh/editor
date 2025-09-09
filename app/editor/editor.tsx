"use client";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { codeBlock } from "@blocknote/code-block";
import { ChevronUp, Trash2, CircleX, CircleCheck } from "lucide-react";
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

import { initialBlocks } from "./initialBlock";

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
import { useRouter } from "next/router";

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

    const [id, setId] = useState(localStorage.getItem("id"));

    const [blocks, setBlocks] = useState<Block[]>(() => {
        try {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem("pageContent");
                const parsed = stored ? JSON.parse(stored) : null;
                return Array.isArray(parsed) ? parsed : initialBlocks;
            }
        } catch {
            return initialBlocks;
        }
        return initialBlocks;
    });

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

    async function updateBlog(id: string, content: string, parsed: string) {
        const res = await updateBlogById(id, content, parsed);
        res.success
            ? toast.success(res.message)
            : toast.error(res.message);
    }

    const debouncedHandleChange = useMemo(() =>
        debounce(async () => {
            const currentContent = editor.document;

            const currentString = JSON.stringify(currentContent);
            const lastString = localStorage.getItem("pageContent");

            if (lastString === currentString) return;

            setBlocks(currentContent);

            const plainText = extractPlainTextFromBlocks(currentContent);
            setParsedContent(plainText);

            localStorage.setItem("pageContent", currentString);
            localStorage.setItem("parsedContent", plainText);

            if (!id) {
                toast.error("Cannot get blog id");
                return;
            }

            await updateBlog(id, currentString, plainText);
        }, 5000), [editor, id]
    );

    const [blogsList, setblogsList] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    async function fetchBlogs() {
        const list = await getBlogsByEmail(userEmail);
        setblogsList(list);
    }

    useEffect(() => {
        fetchBlogs();
    }, [userEmail]);

    useEffect(() => {
        if (editor && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
        }
    }, [blocks, editor]);

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

        const currentContent = Array.isArray(parsed) ? parsed : initialBlocks;
        const plainText = extractPlainTextFromBlocks(currentContent);

        localStorage.setItem("pageContent", JSON.stringify(currentContent));
        localStorage.setItem("parsedContent", plainText);

        setParsedContent(plainText);
        setBlocks(currentContent);

        localStorage.setItem("id", id);
        setId(id);
    }

    return (
        <div className="max-w-5xl w-full mx-auto">
            <span className="fixed top-2 right-2 text-xs">
                <Tooltip>
                    <TooltipTrigger>
                        <CircleCheck />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Saved</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <CircleX />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Saving</p>
                    </TooltipContent>
                </Tooltip>
            </span>
            <div className='min-h-[80vh] mb-8'>
                <div className="max-w-5xl mx-auto pb-[33vh]">
                    <div className="overflow-x-hidden">
                        <BlockNoteView
                            className="pl-0 py-4 -mx-10"
                            spellCheck="false"
                            theme="light"
                            editor={editor}
                            onChange={debouncedHandleChange}
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
                        <ChevronUp className="size-6 hover:bg-accent w-5 h-5" />
                    </span>
                </DrawerTrigger>
                <DrawerContent
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DrawerHeader>
                        <DrawerTitle>Your Creations, {userName}</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                        <ScrollArea className="h-[33vh] max-w-md w-full mx-auto rounded-md">
                            <div className="px-4 flex-col">
                                {
                                    blogsList.map((blog, index) => (
                                        <div key={index} className="-ml-2">
                                            <div className="max-w-md w-full flex items-center gap-2 p-0.5 m-1 mx-auto rounded-lg hover:bg-accent transition">
                                                <Button
                                                    variant="ghost"
                                                    className={`flex-1 justify-start font-medium text-sm sm:text-base truncate
                                                    ${blog.id === id ? "underline text-accent-foreground underline-offset-2" : ""}`}
                                                    title={blog.heading}
                                                    onClick={() => {
                                                        handleGetBlogById(blog.id);
                                                    }}
                                                >
                                                    {blog.heading.charAt(0).toUpperCase() + blog.heading.slice(1)}
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
                                                                This action cannot be undone. This will permanently delete the chapter - <span className="underline underline-offset-2">{blog.heading}</span> and remove its data from our servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={async () => {
                                                                    const res = await deleteBlogById(blog.id);
                                                                    fetchBlogs();
                                                                    res.success
                                                                        ? toast.success(res.message)
                                                                        : toast.error(res.message);
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
                                onClick={async () => {
                                    const res = await createNewBlog(userEmail, userName);
                                    fetchBlogs();
                                    res.success
                                        ? toast.success(res.message)
                                        : toast.error(res.message);
                                    setIsDrawerOpen(false);
                                    localStorage.setItem("id", res.newBlogId || "");
                                    setId(res.newBlogId || "");
                                }}
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
        </div >
    );
}
