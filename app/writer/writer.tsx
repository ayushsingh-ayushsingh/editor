"use client";

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
import { useForm, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import debounce from "lodash.debounce";
import { useEffect, useMemo } from "react";
import { saveChapterContent } from "./save";
import { toast } from "sonner";

interface FormProps {
    name: string;
    email: string;
}

const formSchema = z.object({
    chapter: z.string().min(1, "Chapter is required"),
    author: z.string().min(1, "Author is required"),
    date: z.string().min(1, "Date is required"),
    email: z.string().email("Invalid email"),
    heading: z.string().min(1, "Heading is required"),
    content: z.string().min(1, "Content is required"),
    parsed: z.string(),
    summary: z.string().optional(),
    tags: z.string().optional(),
});

export default function GeneratedForm({ name, email }: FormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            chapter: "",
            author: name,
            date: "",
            email: email,
            heading: "",
            content: "",
            parsed: "",
            summary: "",
            tags: "",
        },
    });

    const watchedValues = useWatch({ control: form.control });

    const debouncedSave = useMemo(
        () =>
            debounce(async (data: z.infer<typeof formSchema>) => {
                const res = await saveChapterContent(data);
                if (res.success) {
                    console.log("Auto-saved!")
                    toast.success("Auto-saved!");
                } else {
                    console.log("Failed to save")
                    toast.error("Failed to save");
                }
            }, 3000),
        []
    );

    useEffect(() => {
        if (watchedValues?.content) {
            form.setValue("parsed", watchedValues.content.toLowerCase());
        }
    }, [watchedValues?.content, form]);

    useEffect(() => {
        const values = form.getValues();
        if (form.formState.isValid) {
            debouncedSave({
                ...values,
                parsed: values.content.toLowerCase(),
            });
        }
        return () => debouncedSave.cancel();
    }, [watchedValues, form.formState.isValid, debouncedSave, form]);

    return (
        <Form {...form}>
            <form className="space-y-8 @container flex items-center min-h-screen">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto p-4 w-full">
                    <FormField
                        control={form.control}
                        name="chapter"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Chapter</FormLabel>
                                <FormControl>
                                    <Input {...field} id="chapter" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Author</FormLabel>
                                <FormControl>
                                    <Input {...field} id="author" readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} id="email" readOnly />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="heading"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Heading</FormLabel>
                                <FormControl>
                                    <Input {...field} id="heading" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input {...field} id="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                    <Input {...field} id="tags" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} id="content" className="h-48" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="parsed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parsed Content</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} id="parsed" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-full">
                        <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Summary</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} id="summary" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    );
}
