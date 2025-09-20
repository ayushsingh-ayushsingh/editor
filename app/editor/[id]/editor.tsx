// app/editor/[id]/editor.tsx
"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Block } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import uploadFile from "./uploadFile";
import { toast } from "sonner";
import { codeBlock } from "@blocknote/code-block";
import { ChevronUp, Trash2, CircleCheck, LoaderCircle, ArrowLeft, Copy, Download } from "lucide-react";
import { createNewBlog, updateBlogById } from "../actions/saveUsersBlog";
import { links } from "./links";

import Link from "next/link";

import Publish from "./publish";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import debounce from "lodash.debounce";

import { filterSuggestionItems } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "../css/styles.css";
import "../css/codeStyles.css";
import {
    FormattingToolbar,
    FormattingToolbarController,
    SuggestionMenuController,
    getDefaultReactSlashMenuItems,
    getFormattingToolbarItems,
    useCreateBlockNote,
} from "@blocknote/react";

import { en as coreAiEn } from "@blocknote/xl-ai/locales"; // fallback if dynamic import fails (safe small import)
// NOTE: we will dynamically import the rest of @blocknote/xl-ai to avoid double-registration runtime issues.

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractPlainTextFromBlocks } from "./initialBlock";
import { getInitialContent } from "./initialBlock";

import { Button } from "@/components/ui/button";

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { getBlogsByEmail, deleteBlogById } from "../actions/getUsersBlogs";
import { getBlogById } from "../actions/getBlogById";

import { useRouter } from "next/navigation";
import GooeyMenu from "@/components/ui/gooey-menu";

interface EditorProps {
    userName: string;
    userEmail: string;
    googleApiKey: string;
    blogId: string;
    initialContent: Block[];
    initialParsedContent: string;
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

export default function Editor({
    userName,
    userEmail,
    googleApiKey,
    blogId,
    initialContent,
    initialParsedContent,
}: EditorProps) {
    const router = useRouter();
    const rootRef = useRef<HTMLDivElement | null>(null);

    const locale = en;

    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [id, setId] = useState<string | null>(blogId ?? null);
    const lastSavedRef = useRef<string>("");

    // Editor content state
    const [blocks, setBlocks] = useState<Block[]>(
        initialContent?.length ? initialContent : getInitialContent()
    );
    const [parsedContent, setParsedContent] = useState(initialParsedContent ?? "");

    function computeHeading(text: string) {
        return text && text.trim().length > 0 ? text.replace(/\s+/g, " ").trim().substring(0, 50) : "...";
    }

    const [heading, setHeading] = useState(() => computeHeading(initialParsedContent ?? ""));
    const lastHeadingRef = useRef(heading);

    const [blogsList, setBlogsList] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    //
    // DYNAMIC XL-AI LOADING
    // We dynamically import the xl-ai module on the client and create the AI extension factory exactly once.
    //
    const [xlAiModule, setXlAiModule] = useState<any | null>(null);
    const [xlAiLocale, setXlAiLocale] = useState<any | null>(null);
    const [aiExtensionFactory, setAiExtensionFactory] = useState<null | ((editor: any) => any)>(null);
    const [aiMenuItemsFn, setAiMenuItemsFn] = useState<null | ((editor: any) => any[])>(null);
    const [AiMenuControllerComponent, setAiMenuControllerComponent] = useState<any | null>(null);
    const [AiToolbarButtonComponent, setAiToolbarButtonComponent] = useState<any | null>(null);

    // create the Google provider instance once (memoized)
    const googleProvider = useMemo(() => {
        try {
            // createGoogleGenerativeAI returns a provider factory; invoke with model name
            return (createGoogleGenerativeAI({ apiKey: googleApiKey || "" }) as any)("gemini-2.5-flash");
        } catch (err) {
            console.warn("createGoogleGenerativeAI error:", err);
            return null;
        }
    }, [googleApiKey]);

    // Dynamically load @blocknote/xl-ai on the client only, then create the extension factory once
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // dynamic import avoids top-level evaluation during SSR or duplicate registration
                const mod = await import("@blocknote/xl-ai");
                // load locales from package dynamically too (safe)
                let localesMod = null;
                try {
                    localesMod = await import("@blocknote/xl-ai/locales");
                } catch {
                    localesMod = { en: coreAiEn }; // fallback
                }

                if (!mounted) return;

                setXlAiModule(mod);
                setXlAiLocale(localesMod?.en ?? coreAiEn);

                // create the factory only once (storing the returned factory function)
                if (mod?.createAIExtension && googleProvider) {
                    try {
                        const factory = mod.createAIExtension({ model: googleProvider } as any);
                        // factory is a function (editor) => AIExtension
                        setAiExtensionFactory(() => factory);
                    } catch (err) {
                        console.warn("createAIExtension failed:", err);
                    }
                }

                // stash other helpers (menu items + UI components)
                if (mod?.getAISlashMenuItems) {
                    setAiMenuItemsFn(() => mod.getAISlashMenuItems);
                }
                if (mod?.AIMenuController) {
                    setAiMenuControllerComponent(() => mod.AIMenuController);
                }
                if (mod?.AIToolbarButton) {
                    setAiToolbarButtonComponent(() => mod.AIToolbarButton);
                }
            } catch (err) {
                console.warn("Dynamic import of @blocknote/xl-ai failed:", err);
            }
        })();

        return () => {
            mounted = false;
        };
        // googleProvider is needed to create factory; reload if key changes
    }, [googleProvider]);

    // create editor once with stable initial content
    // pass the AI extension factory if available (the factory itself is stable because we set it only once)
    const editor = useCreateBlockNote({
        codeBlock,
        tables: {
            splitCells: true,
            cellBackgroundColor: true,
            cellTextColor: true,
            headers: true,
        },
        initialContent: initialContent?.length ? initialContent : getInitialContent(),
        dictionary: {
            ...locale,
            placeholders: {
                ...locale.placeholders,
                emptyDocument: "Render your thoughts here...",
                default: "...",
                heading: "...",
            },
            // if xl-ai locales available use them, else fallback
            ai: xlAiLocale ?? coreAiEn,
        },
        uploadFile,
        // only include extension if factory exists
        // cast to any to avoid cross-package type constraints at compile-time (short term)
        extensions: aiExtensionFactory ? [aiExtensionFactory as unknown as any] : [],
    });

    // fetchBlogs wrapped in useCallback so we can await it from other functions safely
    const fetchBlogs = useCallback(async () => {
        try {
            const list = await getBlogsByEmail(userEmail);
            setBlogsList(list?.blogsList ?? []);
        } catch (err) {
            console.error("fetchBlogs error", err);
            setBlogsList([]);
        }
    }, [userEmail]);

    useEffect(() => {
        void fetchBlogs();
    }, [fetchBlogs]);

    // load a blog into editor (explicit) and navigate to its URL
    async function handleGetBlogById(newId: string) {
        setIsDrawerOpen(false);
        try {
            const res = await getBlogById(newId);
            if (!res?.success || !res?.blog) {
                toast.error(res?.message || "Failed to load blog");
                return;
            }

            const stored = res.blog.content || "";
            const parsed = stored ? JSON.parse(stored) : null;
            const currentContent = Array.isArray(parsed) ? parsed : getInitialContent();
            const plainText = extractPlainTextFromBlocks(currentContent);

            // update editor content immediately for snappy UX
            try {
                editor.replaceBlocks(editor.document, currentContent);
            } catch (err) {
                console.warn("replaceBlocks failed", err);
            }

            setBlocks(currentContent);
            setParsedContent(plainText);

            setId(newId);
            lastSavedRef.current = JSON.stringify(currentContent);
            setSaveStatus("idle");

            const h = computeHeading(plainText);
            setHeading(h);
            lastHeadingRef.current = h;

            // update URL so refresh/bookmark preserves the blog id
            try {
                void router.replace(`/editor/${newId}`);
            } catch (err) {
                console.warn("router.replace failed", err);
            }

            toast.success(res.message || "Blog loaded");
        } catch (err) {
            console.error(err);
            toast.error("Failed to load blog");
        }
    }

    // create a new blog, load initial content, and navigate to its page
    async function handleCreateNewBlog() {
        setIsDrawerOpen(false);
        try {
            const newBlogRes = await createNewBlog(userEmail, userName);
            if (!newBlogRes?.success || !newBlogRes?.newBlogId) {
                toast.error(newBlogRes?.message || "Failed to create new blog");
                return;
            }
            const newBlogId = newBlogRes.newBlogId;
            setId(newBlogId);

            // prepare initial content and put into editor
            const initial = getInitialContent();
            try {
                editor.replaceBlocks(editor.document, initial);
            } catch (err) {
                console.warn("replaceBlocks failed", err);
            }

            setBlocks(initial);
            setParsedContent("");
            lastSavedRef.current = JSON.stringify(initial);
            setHeading("...");
            lastHeadingRef.current = "...";

            // refresh list
            await fetchBlogs();

            // navigate to the blog's URL so refresh/bookmark keeps it
            try {
                void router.replace(`/editor/${newBlogId}`);
            } catch (err) {
                console.warn("router.replace failed", err);
            }

            toast.success("New blog created!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create new blog");
        }
    }

    const saveBlog = useCallback(
        async (force = false) => {
            if (!id) {
                if (force) toast.error("No blog selected to save");
                return;
            }

            try {
                const currentContent = editor.document;
                const currentString = JSON.stringify(currentContent);
                const plainText = extractPlainTextFromBlocks(currentContent);

                if (!force && currentString === lastSavedRef.current) {
                    setSaveStatus("idle");
                    return;
                }

                setSaveStatus("saving");
                const res = await updateBlogById(id, computeHeading(plainText), currentString, plainText);

                if (res?.success) {
                    const newHeading = computeHeading(plainText);
                    setHeading(newHeading);
                    lastHeadingRef.current = newHeading;
                    lastSavedRef.current = currentString;
                    if (force) await fetchBlogs();
                    setSaveStatus("saved");
                    if (force) toast.success("Blog saved");
                } else {
                    setSaveStatus("idle");
                    if (force) toast.error(res?.message || "Failed to save blog");
                }
            } catch (err) {
                console.error("saveBlog error", err);
                setSaveStatus("idle");
                if (force) toast.error("Failed to save blog");
            }
        },
        [id, editor, fetchBlogs]
    );

    // debounce auto-save calls
    const debouncedHandleChange = useMemo(() => debounce(() => void saveBlog(false), 5000), [saveBlog]);

    useEffect(() => {
        return () => {
            debouncedHandleChange.cancel();
        };
    }, [debouncedHandleChange]);

    // ctrl/cmd + S handler
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                void saveBlog(true);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [saveBlog]);

    // sync heading whenever parsed content changes
    useEffect(() => {
        const newHeading = computeHeading(parsedContent);
        if (newHeading !== heading) {
            setHeading(newHeading);
            lastHeadingRef.current = newHeading;
        }
    }, [parsedContent, heading]);

    // editor onChange handler (keeps local states and triggers debounced save)
    function handleEditorChange() {
        try {
            const content = editor.document;
            const currentString = JSON.stringify(content);
            const plainText = extractPlainTextFromBlocks(content);

            setBlocks(content);
            setParsedContent(plainText);

            if (currentString !== lastSavedRef.current) {
                if (saveStatus !== "saving") setSaveStatus("saving");
                debouncedHandleChange();
            }
        } catch (err) {
            console.error("handleEditorChange", err);
        }
    }

    // apply blocks into editor when editor instance appears
    useEffect(() => {
        if (editor && blocks.length > 0) {
            try {
                editor.replaceBlocks(editor.document, blocks);
                lastSavedRef.current = JSON.stringify(blocks);
                setSaveStatus("idle");
            } catch (err) {
                console.warn("initial replaceBlocks failed", err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    async function handleDeleteBlog(blogIdToDelete: string) {
        try {
            const res = await deleteBlogById(blogIdToDelete);
            if (res.success) {
                toast.success("Blog deleted successfully");
                await fetchBlogs();
                if (blogIdToDelete === id) {
                    // create a new blog and navigate to it (function already navigates)
                    await handleCreateNewBlog();
                }
            } else {
                toast.error(res.message || "Failed to delete blog");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete blog");
        }
    }

    function renderTitle(blog: any) {
        if (!blog?.heading) return "Untitled";
        const h: string = blog.heading.trim();
        const slice = h.length > 30 ? h.slice(0, 30).trim() + "..." : h;
        if (slice === "...") return "Untitled";
        return slice.charAt(0).toUpperCase() + slice.slice(1);
    }

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
                <div className="max-w-3xl mx-auto">
                    <div className="overflow-x-hidden relative -mx-12" ref={rootRef}>
                        <BlockNoteView
                            className="pl-0 py-4"
                            spellCheck="false"
                            theme="light"
                            editor={editor}
                            onChange={handleEditorChange}
                            data-theming-css-variables
                            data-changing-font
                            formattingToolbar={true}
                            slashMenu={true}
                        >
                            <span className="fixed top-2 left-2 text-xs flex items-center gap-2">
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

                            {AiMenuControllerComponent ? React.createElement(AiMenuControllerComponent) : null}

                            <FormattingToolbarController
                                formattingToolbar={() => (
                                    <FormattingToolbar>
                                        {getFormattingToolbarItems()}
                                        {AiToolbarButtonComponent ? React.createElement(AiToolbarButtonComponent) : null}
                                    </FormattingToolbar>
                                )}
                            />

                            <SuggestionMenuController
                                triggerCharacter="/"
                                getItems={async (query) =>
                                    filterSuggestionItems(
                                        [
                                            ...getDefaultReactSlashMenuItems(editor as any),
                                            ...(aiMenuItemsFn ? (aiMenuItemsFn as any)(editor as any) : []),
                                        ],
                                        query
                                    )
                                }
                            />
                        </BlockNoteView>

                        <span className="fixed bottom-2 left-2 text-xs flex items-center gap-2 z-50">
                            <GooeyMenu items={links} />
                        </span>

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
                                                <Copy size={16} className="text-green-400" />
                                            ) : status === "downloaded" ? (
                                                <Download size={16} className="text-green-400" />
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

            <span className="fixed top-2 right-2 text-xs flex items-center gap-2 z-50">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={"secondary"} onClick={() => void saveBlog(true)}>
                            <span className="font-light">Save</span>
                            {saveStatus === "saving" && <LoaderCircle className="animate-spin" size={16} strokeWidth={1.5} />}
                            {saveStatus === "saved" && <CircleCheck className="text-primary" size={16} strokeWidth={1.5} />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Save Chapter</p>
                    </TooltipContent>
                </Tooltip>
                <Publish id={id} />
            </span>

            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                    <span className="mx-auto fixed bottom-2 left-0 flex items-center justify-center rounded-md right-0 size-9 hover:bg-accent z-50">
                        <ChevronUp className="size-6 hover:bg-accent w-5 h-5 z-50" strokeWidth={1.5} />
                    </span>
                </DrawerTrigger>

                <DrawerContent className="focus-visible:outline-none focus-visible:ring-0 focus:outline-none focus:ring-0">
                    <DrawerHeader>
                        <DrawerTitle className="text-lg font-medium">Creations By {userName}</DrawerTitle>
                        <DrawerDescription className="sr-only">
                            A list of all the creations of {userName} - {userEmail}
                        </DrawerDescription>

                        <ScrollArea className="h-[33vh] max-w-md w-full mx-auto rounded-md">
                            <div className="px-4 flex-col">
                                {blogsList.map((blog) => (
                                    <div key={blog.id} className="-ml-2">
                                        <div className="max-w-md w-full flex items-center justify-between gap-2 p-0.5 m-1 mx-auto rounded-lg hover:bg-accent transition">
                                            <Button
                                                variant="ghost"
                                                className={`flex-1 min-w-0 justify-start text-md font-light truncate ${blog.id === id ? "underline text-accent-foreground underline-offset-2" : ""
                                                    }`}
                                                title={blog.heading}
                                                onClick={() => void handleGetBlogById(blog.id)}
                                            >
                                                <span className="block truncate text-start">{renderTitle(blog)}</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="shrink-0 dark:hover:bg-card/80 hover:bg-card/80">
                                                        <Trash2 className="text-destructive w-5 h-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the chapter -{" "}
                                                            <span className="underline underline-offset-2">{renderTitle(blog)}</span> and remove its data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={async () => {
                                                                await handleDeleteBlog(blog.id);
                                                            }}
                                                        >
                                                            Continue
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))}

                                <div className="h-[20vh] flex justify-center items-end text-muted-foreground">
                                    {blogsList.length === 0 ? "You have not created any chapter...!" : blogsList.length === 1 ? `You have created a single chapter.` : `You have ${blogsList.length} creations`}
                                </div>
                            </div>
                        </ScrollArea>
                    </DrawerHeader>

                    <DrawerFooter>
                        <div className="max-w-md w-full mx-auto space-y-2">
                            <Button className="max-w-md w-full p-5" onClick={() => void handleCreateNewBlog()}>
                                Craft New Chapter
                            </Button>
                            <Button variant="outline" className="max-w-md w-full p-5" onClick={() => setIsDrawerOpen(false)}>
                                Close Drawer
                            </Button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
