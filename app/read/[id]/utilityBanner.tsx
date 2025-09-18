"use client";

import { Block, BlockNoteEditor } from "@blocknote/core";
import { JSX, useEffect, useReducer, useState } from "react";
import { ClipboardCopy, Copy, Download, FileDown, FilePen, FileText, PencilRuler } from "lucide-react";
import { Button } from "@/components/ui/button copy";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { pdf } from "@react-pdf/renderer";
import {
    PDFExporter,
    pdfDefaultSchemaMappings,
} from "@blocknote/xl-pdf-exporter";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { copyMarkdown, takeNotes, copyPlainText } from "./utilities";
import Link from "next/link";

export default function Utilities({ content, id }: { content: string, id: string }) {
    const blockContent: Block[] = JSON.parse(content);

    const [markdown, setMarkdown] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [minTime, setMinTime] = useState(0);
    const [maxTime, setMaxTime] = useState(0);
    const [pdfDocument, setPDFDocument] = useState<JSX.Element>();
    const [, forceRerender] = useReducer((s) => s + 1, 0);

    useEffect(() => {
        const init = async () => {
            try {
                const editor = BlockNoteEditor.create();

                const markdown = await editor.blocksToMarkdownLossy(blockContent);
                setMarkdown(markdown);

                const plainText = markdown
                    .replace(/[^a-zA-Z0-9 ]/g, "")
                    .replace(/\s+/g, " ")
                    .trim();

                const words = plainText === "" ? 0 : plainText.split(" ").length;
                setWordCount(words);

                const min = Math.ceil(words / 250);
                const max =
                    min === Math.ceil(words / 220)
                        ? min + 1
                        : Math.ceil(words / 220);

                setMinTime(min);
                setMaxTime(max);

                const exporter = new PDFExporter(
                    editor.schema,
                    pdfDefaultSchemaMappings as any
                );
                const pdfDoc = await exporter.toReactPDFDocument(blockContent);
                setPDFDocument(pdfDoc);
                forceRerender();
            } catch (err) {
                console.error("Failed to initialize:", err);
                toast.error("Error preparing content");
            }
        };

        init();
    }, [content]);

    const onDownloadClick = async () => {
        if (!pdfDocument) {
            toast.error("PDF not ready yet!");
            return;
        }
        const blob = await pdf(pdfDocument).toBlob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "My Document (blocknote export).pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(link.href);
    };

    return (
        <div>
            <div className="mx-2 my-2 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="text-sm font-light text-secondary-foreground/80">
                        {minTime}-{maxTime} Minutes Read
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => copyPlainText(blockContent)}
                            >
                                <Copy />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copy Plain Text</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={onDownloadClick}
                            >
                                <Download />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download PDF</p>
                        </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <PencilRuler />
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Utilities</p>
                            </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent className="w-48" align="end">
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => copyMarkdown(markdown)}>
                                    Copy Markdown
                                    <DropdownMenuShortcut>
                                        <ClipboardCopy strokeWidth={1.5} />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Take Notes
                                    <DropdownMenuShortcut>
                                        <FilePen strokeWidth={1.5} />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <Link href={`${id}/pdf`} target="_blank">
                                    <DropdownMenuItem>
                                        Highlight PDF
                                        <DropdownMenuShortcut>
                                            <FileText strokeWidth={1.5} />
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem onClick={onDownloadClick}>
                                    Download PDF
                                    <DropdownMenuShortcut>
                                        <FileDown strokeWidth={1.5} />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div >
    );
}
