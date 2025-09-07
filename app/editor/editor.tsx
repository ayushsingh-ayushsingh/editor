"use client";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useState } from "react";
import { toast } from "sonner";

import { useMemo } from "react";
import debounce from 'lodash.debounce';

import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
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
import { v4 as uuidv4 } from 'uuid';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// import { savePageData } from "./saveToDB"
import { z } from "zod";

const pageDataSchema = z.object({
    id: z.string().uuid(),
    author: z.string().min(1, "Author Not Found"),
    email: z.string().email("Email Address Not Found"),
    content: z.array(z.any()),
    parsedContent: z.string().min(10, "Write atleast 10 characters"),
    date: z.string(),
});

const model = createGoogleGenerativeAI({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
})("gemini-1.5-flash");

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
                default: "...",
                heading: "Heading",
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
                            return "";
                        })
                        .join("")
                        .trim();
                }
                return "";
            })
            .filter(Boolean)
            .join("\n\n");
    }

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

    return (
        <div className="max-w-5xl w-full mx-auto">
            <div className='min-h-[80vh] mb-8' id="text-editor">
                <div className="max-w-5xl mx-auto">
                    <BlockNoteView
                        className="pr-2 pl-0 py-4"
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
