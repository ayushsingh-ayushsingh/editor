import { Block } from "@blocknote/core";

export const storedContent = typeof window !== "undefined"
    ? localStorage.getItem("pageContent")
    : null;

export const initialBlocks: Block[] = storedContent
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