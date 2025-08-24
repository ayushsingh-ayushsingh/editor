"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./styles.css";

import { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";

import { useState } from "react";

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
        },
        uploadFile,
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
            />
        </div>
    );
}
