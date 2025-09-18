"use client"

import { toast } from "sonner";
import { PartialBlock } from "@blocknote/core";

export async function copyMarkdown(markdown: string) {
    try {
        await navigator.clipboard.writeText(markdown);
        toast.success("Markdown copied to clipboard!");
    } catch (err) {
        toast.error(`Failed to copy markdown: ${err}`);
    }
}

type EditorBlock = PartialBlock;

export function getPlainTextFromBlocks(blocks: EditorBlock[]): string {
    return blocks.map(blockPlainText).join("\n").trim();
}

function blockPlainText(block: EditorBlock): string {
    let text = "";

    if (typeof block.content === "string") {
        text += block.content;
    } else if (Array.isArray(block.content)) {
        text += block.content.map(inlinePlainText).join("");
    }

    if (block.children) {
        const childText = block.children.map(blockPlainText).join("\n");
        if (childText) {
            text += "\n" + childText;
        }
    }

    return text;
}

function inlinePlainText(inline: any): string {
    if (typeof inline === "string") {
        return inline;
    }
    if (inline.type === "text") {
        return inline.text;
    }
    if (inline.type === "link") {
        if (typeof inline.content === "string") {
            return inline.content;
        } else if (Array.isArray(inline.content)) {
            return inline.content.map(inlinePlainText).join("");
        }
    }
    return "";
}

export async function copyPlainText(blocks: EditorBlock[]) {
    try {
        const plainText = getPlainTextFromBlocks(blocks);
        await navigator.clipboard.writeText(plainText);
        toast.success("Plain text copied to clipboard!");
    } catch (err) {
        toast.error(`Failed to copy plain text: ${err}`);
    }
}

export function takeNotes() {
    toast.message("Take Notes feature coming soon!");
}