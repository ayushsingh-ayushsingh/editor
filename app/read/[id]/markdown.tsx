"use client"

import { Block, BlockNoteEditor } from "@blocknote/core";
import { useEffect, useState } from "react";
import { Copy, Download, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button copy";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

async function copyMarkdown(markdown: string) {
    try {
        await navigator.clipboard.writeText(markdown);
        toast.success("Markdown copied to clipboard!");
    } catch (err) {
        toast.error(`Failed to copy markdown: ${err}`);
    }
}

function downloadHTMLAsPDF(html: string) {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function takeNotes() {
    toast.message("Take Notes feature coming soon!");
}

export default function BlocksToMarkdown({ content }: { content: string }) {
    const blockContent: Block[] = JSON.parse(content);

    const [html, setHTML] = useState<string>("");
    const [markdown, setMarkdown] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [minTime, setMinTime] = useState(0);
    const [maxTime, setMaxTime] = useState(0);

    useEffect(() => {
        const init = async () => {
            const editor = BlockNoteEditor.create();

            const html = await editor.blocksToHTMLLossy(blockContent);
            setHTML(html);

            const markdown = await editor.blocksToMarkdownLossy(blockContent);
            setMarkdown(markdown);

            const text = markdown.replace(/\s+/g, " ").trim();
            const plainText = text
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/\s+/g, " ")
                .trim();

            const words = plainText === "" ? 0 : plainText.split(" ").length;
            setWordCount(words);

            const minTime = Math.ceil(words / 250);
            setMinTime(minTime);

            const maxTimeCalc =
                minTime === Math.ceil(words / 220) ? minTime + 1 : Math.ceil(words / 220);
            setMaxTime(maxTimeCalc);
        };

        init();
    }, [blockContent]);

    return (
        <div>
            <div className="mx-2 my-2 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="text-sm font-light text-secondary-foreground/80">
                        {minTime}-{maxTime} minute read
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => copyMarkdown(markdown)}
                            >
                                <Copy />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy Markdown</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => downloadHTMLAsPDF(html)}
                            >
                                <Download />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={takeNotes}
                            >
                                <SquarePen />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Take Notes</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
