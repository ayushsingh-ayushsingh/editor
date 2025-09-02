import { Block } from "@blocknote/core";
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Feedback from "./feedback";
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import "./styles.css";

interface EditorProps {
    userName: string;
    userEmail: string;
}

export default function Editor({ userName, userEmail }: EditorProps) {
    // Page content

    const initialBlocks: Block[] = [
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
                    text: "This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block. This is a paragraph block.",
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

    const editor = useCreateBlockNote({
        initialContent: initialBlocks
    });

    const heading = "This is the heading"
    const summary = "This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary. This is the summary."
    const publishDate = "Wed Aug 27 2025"

    return (
        <div className="max-w-5xl w-full mx-auto">
            <div className='w-full'>
                <a
                    href="#viewer"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-14 text-white z-50"
                >
                    Main Content
                </a>
                <div className='px-4'>
                    <h1 className='text-7xl font-extrabold border-l-8 px-4'>
                        <input
                            data-slot="textarea"
                            placeholder='I am writing another article today!'
                            value={heading}
                            maxLength={100}
                            readOnly
                            spellCheck="false"
                            className={
                                "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-4 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground aria-invalid:ring-destructive/20 md:text-7xl/tight sm:text-5xl/tight text-5xl/tight resize-none "
                            }
                        />
                    </h1>
                </div>
            </div>
            <div className="px-4 mr-8 py-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary justify-center items-center flex">
                        A
                    </div>
                    <Link href={"/"} className="cursor-pointer flex gap-2">
                        <span className="hover:underline underline-offset-2 border-r-2 px-2 border-border">
                            Ayush Singh
                        </span>
                        <span className='text-secondary-foreground/75'>
                            {publishDate}
                        </span>
                    </Link>
                </div>
                <Button>
                    Follow
                </Button>
            </div>
            <div id="viewer">
                <div className="max-w-5xl mx-auto">
                    <BlockNoteView
                        className="pr-2 pl-0 py-4"
                        spellCheck="false"
                        theme="light"
                        editor={editor}
                        editable={false}
                        data-theming-css-variables-demo
                    />
                </div>
            </div>
            <div className='w-full py-4 mt-10'>
                <div className='p-4'>
                    <div className='flex items-center justify-between'>
                        <span className='text-5xl sm:text-5xl md:text-7xl font-extrabold border-l-8 px-8 py-2'>
                            tl;dr
                        </span>
                    </div>
                    <div className='mb-4 mr-8'>
                        <textarea
                            data-slot="textarea"
                            spellCheck="false"
                            readOnly
                            placeholder='Here goes the summary of the page, you may craft a complete summary, or just an outline or you may ask Maya to generate tl;dr for you by clicking the generate button...'
                            value={summary}
                            className={
                                "placeholder:text-muted-foreground aria-invalid:border-destructive resize-none flex field-sizing-content min-h-16 w-full rounded-md pl-6 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/0 bg-transparent px-2 py-4 my-4 ml-4"
                            }
                        />
                    </div>
                </div>
            </div>
            <div className="mx-10 mb-10">
                <Feedback />
            </div>
        </div>
    );
}
