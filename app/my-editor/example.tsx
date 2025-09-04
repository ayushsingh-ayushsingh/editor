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
]

export function GeneratedForm({ id }: { id: string }) {
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

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
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
                        name=""
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
    const [thisContent, setThisContent] = useState("");

    return (
        <div className='mx-auto max-w-7xl p-4'>
            <GeneratedForm id={thisContent} />
            <div className='flex flex-col gap-2'>
                {
                    jsondata.map((value, index) => {
                        return (
                            <div key={index}>
                                <Button
                                    variant={'secondary'}
                                    onClick={() => setThisContent(value.id)}
                                    className='cursor-pointer'
                                >
                                    {value.heading}
                                </Button>
                            </div>
                        )
                    })
                }
                <div>
                    <Button
                        variant={'default'}
                        className='cursor-pointer'
                    >
                        New
                    </Button>
                </div>
            </div>
        </div>
    )
}
