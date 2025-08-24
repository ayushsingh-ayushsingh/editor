"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./styles.css";

import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { useState } from "react";

import { createGroq } from '@ai-sdk/groq';
import { BlockNoteEditor, filterSuggestionItems } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
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

const model = createGroq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
})('llama-3.3-70b-versatile');

export default function Editor() {
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

    const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

    const editor = useCreateBlockNote({
        initialContent: initialBlocks,
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

    const handleEditorChange = () => {
        const currentContent = editor.document;
        setBlocks(currentContent);
        localStorage.setItem("pageContent", JSON.stringify(currentContent));
    };

    return (
        <div className="max-w-5xl mx-auto">
            <BlockNoteView
                className="pr-2 pl-0 py-4"
                spellCheck="false"
                theme="light"
                editor={editor}
                onChange={handleEditorChange}
                data-theming-css-variables-demo
            >
                <AIMenuController />
                <FormattingToolbarWithAI />
                <SuggestionMenuWithAI editor={editor} />
            </BlockNoteView>
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
