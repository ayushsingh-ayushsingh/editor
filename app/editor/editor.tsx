"use client";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { codeBlock } from "@blocknote/code-block";
import { ChevronUp, Trash2 } from "lucide-react";
import { createNewBlog } from "./saveUsersBlog";

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
import "./styles.css";
import "./codeStyles.css"
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
import { v4 as uuidv4 } from 'uuid';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { ScrollArea } from "@/components/ui/scroll-area"

import { extractPlainTextFromBlocks } from "./initialBlock";

import { z } from "zod";
import { initialBlocks } from "./initialBlock";

import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { getBlogsByEmail, deleteBlogById } from "./getUsersBlogs";

const pageDataSchema = z.object({
    id: z.string().uuid(),
    author: z.string().min(1, "Author Not Found"),
    email: z.string().email("Email Address Not Found"),
    content: z.array(z.any()),
    parsedContent: z.string().min(10, "Write atleast 10 characters"),
    date: z.string(),
});

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

    const debouncedHandleChange = useMemo(() => debounce(() => {
        const currentContent = editor.document;
        setBlocks(currentContent);

        const plainText = extractPlainTextFromBlocks(currentContent);
        setParsedContent(plainText);

        localStorage.setItem("pageContent", JSON.stringify(currentContent));
        localStorage.setItem("parsedContent", plainText);


    }, 1000), [editor]);

    // Parsed Content

    const [parsedContent, setParsedContent] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("parsedContent") || "";
        }
        return "";
    });

    // Final data to be stored

    const [pageId] = useState(() => uuidv4());

    const pageData = {
        id: pageId,
        author: userName,
        email: userEmail,
        content: blocks,
        parsedContent,
        date: new Date().toISOString(),
    };

    // Save to Database

    const handleSave = async () => {
        try {
            // Validate data
            pageDataSchema.parse(pageData);

            // If validation passes, save
            // const response = await savePageData(pageData);
            toast.success("Article saved successfully!");
            // console.log("Saved:", response);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(({ message }) => toast.error(message));
            } else {
                toast.error("Failed to save article.");
                console.error(error);
            }
        }
    };

    const [blogsList, setblogsList] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    async function fetchBlogs() {
        const list = await getBlogsByEmail(userEmail);
        setblogsList(list);
    }

    useEffect(() => {
        fetchBlogs();
    }, [userEmail]);

    return (
        <div className="max-w-5xl w-full mx-auto">
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
                            <div className="px-4">
                                {blogsList.map((blog, index) => (
                                    <div key={index} className="border-b -ml-2">
                                        <div className="max-w-md w-full flex items-center gap-2 p-0.5 m-1 mx-auto rounded-lg hover:bg-accent transition">
                                            <Button
                                                variant="ghost"
                                                className="flex-1 justify-start font-medium text-sm sm:text-base truncate"
                                                title={blog.heading}
                                                onClick={() => setIsDrawerOpen(false)}
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
                                    </div>
                                ))}
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
