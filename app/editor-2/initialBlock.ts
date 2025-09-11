import { Block } from "@blocknote/core";
import quotes from "./actions/quotes.json" assert { type: "json" };

export function getInitialContent(): Block[] {
    const q = quotes[Math.floor(Math.random() * quotes.length)];

    return [
        {
            id: crypto.randomUUID(),
            type: "heading",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
                level: 1,
                isToggleable: false,
            },
            content: [{ type: "text", text: q.author, styles: {} }],
            children: [],
        },
        {
            id: crypto.randomUUID(),
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        },
        {
            id: crypto.randomUUID(),
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [{ type: "text", text: q.text, styles: {} }],
            children: [],
        },
        {
            id: crypto.randomUUID(),
            type: "paragraph",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [],
            children: [],
        },
        {
            id: crypto.randomUUID(),
            type: "quote",
            props: {
                textColor: "default",
                backgroundColor: "default",
                textAlignment: "left",
            },
            content: [{ type: "text", text: "Press ctrl + s to save", styles: {} }],
            children: [],
        },
        {
            id: crypto.randomUUID(),
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
}

export function extractPlainTextFromBlocks(blocks: Block[]): string {
    return blocks
        .map((block) => {
            if (Array.isArray(block.content)) {
                return block.content
                    .map((item) => (item.type === "text" ? item.text : ""))
                    .join("")
                    .trim();
            }
            return "";
        })
        .filter(Boolean)
        .join("\n\n");
}
