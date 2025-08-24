"use client"

import React, { useEffect } from 'react'
import { Editor } from "./dynamicEditor";
import { Button } from '@/components/ui/button';
import { Tag, TagInput } from 'tagmento';
import { Sparkles } from 'lucide-react';

export default function Page() {
    const [tags, setTags] = React.useState<Tag[]>([]);
    const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(null);
    const [heading, setHeading] = React.useState("");
    const [summary, setSummary] = React.useState("");

    useEffect(() => {
        const storedHeading = localStorage.getItem("heading");
        if (storedHeading) setHeading(storedHeading);
    }, []);

    useEffect(() => {
        const storedSummary = localStorage.getItem("summary");
        if (storedSummary) setSummary(storedSummary);
    }, []);

    useEffect(() => {
        const storedTags = localStorage.getItem("tags");
        if (storedTags) setTags(JSON.parse(storedTags));
    }, []);

    useEffect(() => {
        localStorage.setItem("heading", heading);
    }, [heading]);

    useEffect(() => {
        localStorage.setItem("summary", summary);
    }, [summary]);

    useEffect(() => {
        localStorage.setItem("tags", JSON.stringify(tags));
    }, [tags]);

    const handleGenerateSummary = () => {
        setSummary("This is a generated summary based on the article content.");
    };

    return (
        <div className='max-w-5xl mx-auto'>
            <div className='w-full py-4'>
                <a
                    href="#text-editor"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 text-white z-50"
                >
                    Start work
                </a>
                <div className='p-4'>
                    <h1 className='text-7xl font-extrabold border-l-8 px-4'>
                        <textarea
                            data-slot="textarea"
                            placeholder='I am writing another article today!'
                            value={heading}
                            spellCheck="false"
                            onChange={(event) => setHeading(event.target.value)}
                            className={
                                "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-4 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground aria-invalid:ring-destructive/20 md:text-7xl/tight sm:text-5xl/tight text-5xl/tight resize-none "
                            }
                        />
                    </h1>
                    <div className='flex gap-6 justify-between px-10 py-2 text-lg underline-offset-2'>
                        <span className='text-secondary-foreground/75'>
                            {new Date().toDateString()}
                        </span>
                        <span className='text-primary'>
                            ~ Ayush Singh
                        </span>
                    </div>
                </div>
            </div>
            <div className='min-h-[120vh] mb-36' id="text-editor">
                <Editor />
            </div>
            <div className='w-full py-4 mt-10'>
                <div className='p-4'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-5xl sm:text-5xl md:text-7xl font-extrabold border-l-8 px-8 py-2'>
                            tl;dr
                        </h1>
                        <Button className='m-4' onClick={handleGenerateSummary}><Sparkles /></Button>
                    </div>
                    <div className='mb-4'>
                        <textarea
                            data-slot="textarea"
                            placeholder='Here goes the summary of the page, you may craft a complete summary, or just an outline or you may ask Maya to generate tl;dr for you by clicking the generate button...'
                            value={summary}
                            onChange={(event) => setSummary(event.target.value)}
                            className={
                                "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive resize-none flex field-sizing-content min-h-16 w-full rounded-md pl-6 outline-none disabled:cursor-not-allowed disabled:opacity-50 border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/0 bg-transparent px-3 py-4 focus-visible:ring-[3px] my-4"
                            }
                        />
                    </div>
                    <TagInput
                        placeholder="Add comma seperated tags..."
                        tags={tags}
                        setTags={setTags}
                        className='p-2'
                        activeTagIndex={activeTagIndex}
                        setActiveTagIndex={setActiveTagIndex}
                    />
                </div>
            </div>
        </div>
    )
}
