"use client";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useState } from "react";
import { toast } from "sonner";

import { useMemo } from "react";
import debounce from 'lodash.debounce';

import { createGroq } from '@ai-sdk/groq';
import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import "./styles.css";
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
import { TagInput } from 'tagmento';
import { Button } from '@/components/ui/button';
import { Tag } from 'tagmento';
import { useEffect } from 'react'
import { Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { savePageData } from "./saveToDB"
import { z } from "zod";

const pageDataSchema = z.object({
    id: z.string().uuid(),
    heading: z.string().min(3, "Heading is required"),
    author: z.string().min(1, "Author Not Found"),
    email: z.string().email("Email Address Not Found"),
    summary: z.string().optional(),
    content: z.array(z.any()),
    parsedContent: z.string().min(10, "Write atleast 10 characters"),
    date: z.string(),
    tags: z.array(z.string()),
});

const model = createGroq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
})('llama-3.3-70b-versatile');

interface EditorProps {
    userName: string;
    userEmail: string;
    content?: string;
}

export default function Editor({ userName, userEmail, content }: EditorProps) {
    // Page content

    const locale = en;

    const storedContent = typeof window !== "undefined"
        ? localStorage.getItem("pageContent")
        : null;

    const initialBlocks: Block[] = storedContent
        ? JSON.parse(storedContent)
        : [
            {
                id: "fc62cb59-99a9-435e-b6b7-84af6fe7e4eb",
                type: "paragraph",
                props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                },
                content: [
                    {
                        type: "text",
                        text: "Welcome to this demo! this is the new text...",
                        styles: {},
                    },
                ],
                children: [],
            },
            {
                id: "7735f8e9-87cb-4af7-bbac-c62cc9aac008",
                type: "heading",
                props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                    level: 1,
                    isToggleable: false,
                },
                content: [
                    {
                        type: "text",
                        text: "This is a heading block",
                        styles: {},
                    },
                ],
                children: [],
            },
            {
                id: "a0087c26-b919-4f6a-b5e1-dd52fd85cb05",
                type: "paragraph",
                props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                },
                content: [
                    {
                        type: "text",
                        text: "This is a paragraph block",
                        styles: {},
                    },
                ],
                children: [],
            },
            {
                id: "5f1bbe0e-fcab-4174-a1d6-a3bcd86e7a38",
                type: "paragraph",
                props: {
                    textColor: "default",
                    backgroundColor: "default",
                    textAlignment: "left",
                },
                content: [],
                children: [],
            },
        ];

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
        initialContent: blocks,
        dictionary: {
            ...locale,
            placeholders: {
                ...locale.placeholders,
                emptyDocument: "Render your thoughts here...",
                default: "Type here...",
                heading: "First Heading",
            },
            ai: aiEn
        },
        uploadFile,
        extensions: [
            createAIExtension({
                model,
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

    // Heading

    const [heading, setHeading] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("heading") || "";
        }
        return "";
    });

    useEffect(() => {
        localStorage.setItem("heading", heading);
    }, [heading]);

    // Tags

    const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(null);
    const [tags, setTags] = useState<Tag[]>(() => {
        try {
            const storedTags = localStorage.getItem("tags");
            const parsed = storedTags ? JSON.parse(storedTags) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("tags", JSON.stringify(tags));
    }, [tags]);

    // Summary

    const [summary, setSummary] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("summary") || "";
        }
        return "";
    });

    useEffect(() => {
        localStorage.setItem("summary", summary);
    }, [summary]);

    const handleGenerateSummary = () => {
        setSummary("This is a generated summary based on the article content.");
    };

    // Parsed Content

    function extractPlainTextFromBlocks(blocks: Block[]): string {
        return blocks
            .map((block) => {
                if (Array.isArray(block.content)) {
                    return block.content
                        .map((item) => {
                            if (item.type === "text") {
                                return item.text;
                            }
                            return ""; // You can expand this for links, mentions, etc.
                        })
                        .join("")
                        .trim();
                }
                return "";
            })
            .filter(Boolean)
            .join("\n\n"); // double line break between blocks
    }

    const [parsedContent, setParsedContent] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("parsedContent") || "";
        }
        return "";
    });

    // Final data to be stored

    const simplifiedTags = tags.map(tag => tag.text.trim().toLowerCase());
    const [pageId] = useState(() => uuidv4());

    const pageData = {
        id: pageId,
        heading,
        author: userName,
        email: userEmail,
        summary,
        content: blocks,
        parsedContent,
        date: new Date().toISOString(),
        tags: simplifiedTags,
    };

    // Save to Database

    const handleSave = async () => {
        try {
            // Validate data
            pageDataSchema.parse(pageData);

            // If validation passes, save
            const response = await savePageData(pageData);
            toast.success("Article saved successfully!");
            console.log("Saved:", response);
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(({ message }) => toast.error(message));
            } else {
                toast.error("Failed to save article.");
                console.error(error);
            }
        }
    };

    return (
        <div className="max-w-5xl w-full mx-auto">
            <div className='w-full'>
                <a
                    href="#text-editor"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-14 text-white z-50"
                >
                    Start work
                </a>
                <div className='px-4'>
                    <h1 className='text-7xl font-extrabold border-l-8 px-4'>
                        <input
                            data-slot="textarea"
                            placeholder='I am writing another article today!'
                            value={heading}
                            maxLength={100}
                            spellCheck="false"
                            onChange={(event) => setHeading(event.target.value)}
                            className={
                                "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-4 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground aria-invalid:ring-destructive/20 md:text-7xl/tight sm:text-5xl/tight text-5xl/tight resize-none "
                            }
                        />
                    </h1>
                    <div className='flex gap-6 justify-between px-10 py-2 text-lg underline-offset-2'>
                        <span className='text-secondary-foreground/75'>
                            {new Date().toDateString()}
                        </span>
                        <span className="text-primary max-w-[150px] truncate inline-block">
                            ~ {userName}
                        </span>
                    </div>
                </div>
            </div>
            <Button
                className="m-4"
                onClick={handleSave}
            >
                Save Article
            </Button>
            <div className='min-h-[100vh] mb-8' id="text-editor">
                <div className="max-w-5xl mx-auto">
                    <BlockNoteView
                        className="pr-2 pl-0 py-4"
                        spellCheck="false"
                        theme="light"
                        editor={editor}
                        onChange={debouncedHandleChange}
                        data-theming-css-variables-demo
                    >
                        <AIMenuController />
                        <FormattingToolbarWithAI />
                        <SuggestionMenuWithAI editor={editor} />
                    </BlockNoteView>
                </div>
            </div>
            <div className='w-full py-4 mt-10'>
                <div className='p-4'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-5xl sm:text-5xl md:text-7xl font-extrabold border-l-8 px-8 py-2'>
                            tl;dr
                        </h1>
                        <Button className='m-4' onClick={handleGenerateSummary}><Sparkles /></Button>
                    </div>
                    <div className='mb-4'>
                        <textarea
                            data-slot="textarea"
                            spellCheck="false"
                            placeholder='Here goes the summary of the page, you may craft a complete summary, or just an outline or you may ask Maya to generate tl;dr for you by clicking the generate button...'
                            value={summary}
                            onChange={(event) => setSummary(event.target.value)}
                            className={
                                "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive resize-none flex field-sizing-content min-h-16 w-full rounded-md pl-6 outline-none disabled:cursor-not-allowed disabled:opacity-50 border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/0 bg-transparent px-3 py-4 focus-visible:ring-[3px] my-4"
                            }
                        />
                    </div>
                    <TagInput
                        placeholder="Add comma seperated tags..."
                        tags={tags}
                        setTags={setTags}
                        className='p-2'
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                    />
                </div>
            </div>
        </div>
    );
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
