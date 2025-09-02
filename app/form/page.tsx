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
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveBlog } from "./saveBlog";
import { toast } from "sonner";

export default function GeneratedForm() {
    const formSchema = z.object({
        author: z.string(),
        chapter: z.string(),
        email: z.string(),
        date: z.string(),
        heading: z.string(),
        tags: z.string(),
        summary: z.string(),
        content: z.string(),
        parsed: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            author: "",
            chapter: "",
            email: "",
            date: "",
            heading: "",
            tags: "",
            summary: "",
            content: "",
            parsed: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        const response = await saveBlog(values);
        if (response.success)
            toast.message(response.message);
        else
            toast.error(response.message.slice(0, 40) + "...");
        console.log(response.message)
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
                className="space-y-8 @container m-4 p-4 w-xl mx-auto"
            >
                <div className="grid grid-cols-12 gap-4">
                    <FormField
                        control={form.control}
                        name="chapter"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Chapter</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-0"
                                                placeholder=""
                                                type="number"
                                                id="chapter"
                                                className=""
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="author"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Author</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-0"
                                                placeholder=""
                                                type="text"
                                                id="author"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Email</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-0"
                                                placeholder=""
                                                type="text"
                                                id="email"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Date</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-1"
                                                placeholder=""
                                                type="text"
                                                id="date"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="heading"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Heading</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-2"
                                                placeholder=""
                                                type="text"
                                                id="heading"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Tags</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input
                                                key="text-input-3"
                                                placeholder=""
                                                type="text"
                                                id="tags"
                                                className=" "
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Summary</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <Textarea
                                            key="textarea-0"
                                            id="summary"
                                            placeholder=""
                                            className=""
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Content</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <Textarea
                                            key="textarea-1"
                                            id="content"
                                            placeholder=""
                                            className=""
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="parsed"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0">Parsed Content</FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <Textarea
                                            key="textarea-2"
                                            id="parsed"
                                            placeholder=""
                                            className=""
                                            {...field}
                                        />
                                    </FormControl>

                                    <FormMessage className="mt-1" />
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                        <FormLabel className="hidden shrink-0">Submit</FormLabel>

                        <div className="w-full">
                            <FormControl>
                                <Button
                                    key="submit-button-0"
                                    id="submit"
                                    name="submit"
                                    className="w-full"
                                    type="submit"
                                    variant="default"
                                >
                                    Submit
                                </Button>
                            </FormControl>

                            <FormMessage className="mt-1" />
                        </div>
                    </FormItem>
                </div>
            </form>
        </Form>
    );
}
