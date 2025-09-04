"use client";

import React, { useState, useEffect } from 'react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { savePageData } from "./saveToDB";
import { v4 as uuidv4 } from "uuid";

const jsondata = [
    {
        id: "12345",
        heading: "Ayush Singh",
        content: "I am Ayush Singh",
    },
    {
        id: "67890",
        heading: "Priya Singh",
        content: "My sister is Priya Singh",
    }
];

export function GeneratedForm({ id, heading, email, author }: { id: string; heading: string; email: string; author: string }) {
    const formSchema = z.object({ "textarea-0": z.string() });

    let value = "Default value";
    for (let i = 0; i < jsondata.length; i++) {
        if (jsondata[i].id === id) {
            value = jsondata[i].content;
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            "textarea-0": value,
        },
    });

    useEffect(() => {
        const newValue = jsondata.find(d => d.id === id)?.content ?? "Default value";
        form.reset({ "textarea-0": newValue });
    }, [id, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await savePageData({
                id: id || uuidv4(),
                chapterId: "", // let server action handle upsert
                heading,
                author,
                email,
                content: JSON.stringify(values["textarea-0"]),
                parsed: values["textarea-0"],
                date: new Date().toISOString(),
            });
            alert("Saved successfully!");
        } catch (err: any) {
            alert("Error saving: " + err.message);
        }
    }

    function onReset() {
        form.reset();
        form.clearErrors();
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                onReset={onReset}
                className="space-y-8 @container"
            >
                <div className="grid grid-cols-12 gap-4 mb-2">
                    <FormField
                        control={form.control}
                        name="textarea-0"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Text Area</FormLabel>
                                <div className="w-full">
                                    <FormControl>
                                        <Textarea
                                            key="textarea-0"
                                            id="textarea-0"
                                            placeholder=""
                                            className=""
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                    <Button
                        key="submit-button-0"
                        id="submit-button-0"
                        className="w-full"
                        type="submit"
                        variant="default"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export function Example() {
    const [thisContent, setThisContent] = useState<string>("12345");

    return (
        <div className='mx-auto max-w-7xl p-4'>
            <GeneratedForm
                id={thisContent}
                heading="Demo Heading"
                email="demo@example.com"
                author="Demo Author"
            />
            <div className='flex flex-col gap-2 mt-4'>
                <div>
                    <Button
                        variant={'default'}
                        className='cursor-pointer'
                        onClick={() => setThisContent(uuidv4())} // new blank page
                    >
                        New
                    </Button>
                </div>
                {
                    jsondata.map((value, index) => (
                        <div key={index}>
                            <Button
                                variant={'secondary'}
                                onClick={() => setThisContent(value.id)}
                                className='cursor-pointer'
                            >
                                {value.heading}
                            </Button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
