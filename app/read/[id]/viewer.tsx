"use client";

import { useEffect, useRef, useState } from "react";
import { Block } from "@blocknote/core";
import { codeBlock } from "@blocknote/code-block";
import { ArrowLeft, Copy, Download } from "lucide-react";

import Link from "next/link";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { BlockNoteView } from "@blocknote/mantine";

import "@blocknote/mantine/style.css";
import "../css/styles.css";
import "../css/codeStyles.css";

import { useCreateBlockNote } from "@blocknote/react";
import { Button } from "@/components/ui/button";

interface ViewerProps {
    initialContent: Block[];
}

/**
 * Selector used to find code block or file block containers inside BlockNote.
 */
const TARGET_SELECTOR = `
  .bn-block-content[data-content-type="codeBlock"],
  .bn-block-content[data-content-type="codeBlock-inline"],
  .bn-block-content[class*="language-"],
  .bn-block-content.language-javascript,
  .bn-block-content.language-typescript,
  .bn-block-content[data-content-type="file"]
`;

export default function Viewer({ initialContent }: ViewerProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const editor = useCreateBlockNote({
        codeBlock,
        initialContent,
    });

    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState<{ top: number; right: number }>({
        top: 0,
        right: 16,
    });

    const targetRef = useRef<Element | null>(null);
    const buttonRef = useRef<HTMLDivElement | null>(null);

    const hideTimerRef = useRef<number | null>(null);
    const actionTimerRef = useRef<number | null>(null);

    const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");

    function placeButtonOver(target: Element) {
        const root = rootRef.current;
        if (!root) return;

        const rootRect = root.getBoundingClientRect();
        const rect = (target as HTMLElement).getBoundingClientRect();

        const top = rect.top - rootRect.top + (root.scrollTop ?? 0) + 8;
        const right = rootRect.right - rect.right + 8;

        const clampedTop = Math.max(
            8,
            Math.min(top, Math.max(8, root.clientHeight - 40))
        );
        const clampedRight = Math.max(
            8,
            Math.min(right, Math.max(8, root.clientWidth - 40))
        );

        setPos({ top: clampedTop, right: clampedRight });
    }

    function isPointerOverBlockOrButton() {
        try {
            const btn = buttonRef.current;
            const tgt = targetRef.current;
            const btnHover = btn ? (btn as HTMLElement).matches(":hover") : false;
            const tgtHover = tgt ? (tgt as HTMLElement).matches(":hover") : false;
            return btnHover || tgtHover;
        } catch {
            return false;
        }
    }

    async function copyFromTarget() {
        const target = targetRef.current;
        if (!target) return { ok: false, msg: "No target" };

        try {
            const codeEl =
                (target.querySelector?.("pre code") as HTMLElement | null) ??
                (target.querySelector?.("code") as HTMLElement | null) ??
                (target.querySelector?.(".bn-inline-content") as HTMLElement | null) ??
                (target as HTMLElement);

            const text = codeEl?.innerText ?? codeEl?.textContent ?? "";

            if (!text) return { ok: false, msg: "Empty code" };

            await navigator.clipboard.writeText(text);
            return { ok: true };
        } catch (err) {
            console.error("copy error", err);
            return { ok: false, msg: "Copy failed" };
        }
    }

    async function downloadFromTarget() {
        const target = targetRef.current;
        if (!target) return { ok: false, msg: "No target" };

        try {
            const fileName = target.getAttribute("data-name") ?? "download";
            const fileUrl = target.getAttribute("data-url");

            if (!fileUrl) return { ok: false, msg: "No file url" };

            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = fileName;
            link.click();

            return { ok: true };
        } catch (err) {
            console.error("download error", err);
            return { ok: false, msg: "Download failed" };
        }
    }

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const prevPos = window.getComputedStyle(root).position;
        if (prevPos === "static" || !prevPos) {
            root.style.position = "relative";
        }

        function clearHideTimer() {
            if (hideTimerRef.current) {
                window.clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        }
        function clearActionTimer() {
            if (actionTimerRef.current) {
                window.clearTimeout(actionTimerRef.current);
                actionTimerRef.current = null;
            }
        }

        function onPointerOver(e: PointerEvent) {
            const el = (e.target as Element).closest?.(
                TARGET_SELECTOR
            ) as Element | null;
            if (!el) return;

            clearHideTimer();
            targetRef.current = el;
            placeButtonOver(el);
            setVisible(true);
        }

        function onPointerOut(e: PointerEvent) {
            const from = e.target as Element;
            const to = (e.relatedTarget as Element | null) ?? null;
            const fromBlock = from?.closest ? from.closest(TARGET_SELECTOR) : null;
            const toBlock = to?.closest ? to.closest(TARGET_SELECTOR) : null;

            if (fromBlock && toBlock) return;

            if (to && buttonRef.current && buttonRef.current.contains(to)) {
                return;
            }

            clearHideTimer();
            hideTimerRef.current = window.setTimeout(() => {
                if (isPointerOverBlockOrButton()) {
                    hideTimerRef.current = null;
                    return;
                }
                setVisible(false);
                targetRef.current = null;
                hideTimerRef.current = null;
            }, 200);
        }

        root.addEventListener("pointerover", onPointerOver);
        root.addEventListener("pointerout", onPointerOut);

        const onScrollOrResize = () => {
            const t = targetRef.current;
            if (t && visible) placeButtonOver(t);
        };
        window.addEventListener("scroll", onScrollOrResize, true);
        window.addEventListener("resize", onScrollOrResize);

        return () => {
            root.removeEventListener("pointerover", onPointerOver);
            root.removeEventListener("pointerout", onPointerOut);
            window.removeEventListener("scroll", onScrollOrResize, true);
            window.removeEventListener("resize", onScrollOrResize);

            clearHideTimer();
            clearActionTimer();
        };
    }, [editor, visible]);

    async function handleClick() {
        if (!targetRef.current) return;

        const isFile = targetRef.current.matches(
            '[data-content-type="file"], .bn-block-content[data-content-type="file"]'
        );

        if (actionTimerRef.current) {
            window.clearTimeout(actionTimerRef.current);
            actionTimerRef.current = null;
        }

        if (isFile) {
            const res = await downloadFromTarget();
            if (res.ok) {
                setStatus("downloaded");
                actionTimerRef.current = window.setTimeout(() => {
                    setStatus("idle");
                    if (!isPointerOverBlockOrButton()) {
                        setVisible(false);
                        targetRef.current = null;
                    }
                }, 150);
            }
        } else {
            const res = await copyFromTarget();
            if (res.ok) {
                setStatus("copied");
                actionTimerRef.current = window.setTimeout(() => {
                    setStatus("idle");
                    if (!isPointerOverBlockOrButton()) {
                        setVisible(false);
                        targetRef.current = null;
                    }
                }, 150);
            }
        }
    }

    return (
        <div className="max-w-5xl w-full mx-auto">
            <div className="min-h-[80vh] mb-8">
                <div className="max-w-5xl mx-auto">
                    <div className="overflow-x-hidden relative" ref={rootRef}>
                        <BlockNoteView
                            className="p-2 -mx-10 mt-20"
                            spellCheck="false"
                            theme="light"
                            editor={editor}
                            editable={false}
                            data-theming-css-variables
                            data-changing-font
                            formattingToolbar={false}
                            slashMenu={false}
                        >
                            <span className="fixed top-4 left-4 text-xs flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="link" size="icon" asChild>
                                            <Link href="/dashboard">
                                                <ArrowLeft />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Home</p>
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </BlockNoteView>

                        {visible && targetRef.current && (
                            <div
                                ref={buttonRef}
                                style={{
                                    position: "absolute",
                                    top: `${pos.top}px`,
                                    right: `${pos.right}px`,
                                    zIndex: 9999,
                                }}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="border-neutral-500 border bg-neutral-700 shadow-xs hover:bg-neutral-600 rounded-sm"
                                            onClick={handleClick}
                                        >
                                            {status === "copied" ? (
                                                <Copy size={16} className="text-primary" />
                                            ) : status === "downloaded" ? (
                                                <Download size={16} className="text-primary" />
                                            ) : targetRef.current?.matches(
                                                '[data-content-type="file"], .bn-block-content[data-content-type="file"]'
                                            ) ? (
                                                <Download size={16} className="text-neutral-50" />
                                            ) : (
                                                <Copy size={16} className="text-neutral-50" />
                                            )}
                                            <span className="text-xs sr-only">
                                                {status === "copied"
                                                    ? "Copied"
                                                    : status === "downloaded"
                                                        ? "Downloaded"
                                                        : targetRef.current?.matches(
                                                            '[data-content-type="file"], .bn-block-content[data-content-type="file"]'
                                                        )
                                                            ? "Download"
                                                            : "Copy"}
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {status === "copied"
                                                ? "Copied"
                                                : status === "downloaded"
                                                    ? "Downloaded"
                                                    : targetRef.current?.matches(
                                                        '[data-content-type="file"], .bn-block-content[data-content-type="file"]'
                                                    )
                                                        ? "Download file"
                                                        : "Copy code"}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
