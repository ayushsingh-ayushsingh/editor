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
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackForm() {
    const formSchema = z.object({ "textarea-0": z.string() });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            "textarea-0": "",
        },
    });

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
                <div className="grid grid-cols-12 gap-4">
                    <FormField
                        control={form.control}
                        name="textarea-0"
                        render={({ field }) => (
                            <FormItem className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start">
                                <FormLabel className="flex shrink-0 text-xl pb-2">
                                    Feedback
                                </FormLabel>
                                <div className="w-full">
                                    <FormControl>
                                        <Textarea
                                            key="textarea-0"
                                            id="textarea-0"
                                            placeholder="Type your feedback here. Only visible to the author."
                                            className=""
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    );
}
