// components/publishForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import uploadFile from "./uploadFile";
import { publishBlog } from "../actions/publishBlog";
import { toast } from "sonner";

const MAX_BYTES = 30 * 1024 * 1024;
const SOURCE_MIN = 5;
const SOURCE_MAX = 100;

const schema = z.object({
    bannerInput: z.any().optional(),
    source: z.string().optional(),
    "radio-0": z.enum(["unlisted", "public"]),
});

type FormSchema = z.infer<typeof schema>;

type Props = {
    blogId: string;
};

export default function GeneratedForm({ blogId }: Props) {
    const form = useForm<FormSchema>({
        resolver: zodResolver(schema),
        defaultValues: {
            bannerInput: undefined,
            source: "",
            "radio-0": "unlisted",
        },
        mode: "onChange",
    });

    const {
        handleSubmit,
        setError,
        clearErrors,
        reset,
        control,
        watch,
        formState: { isSubmitting, errors },
    } = form;

    const watchedBanner = watch("bannerInput");
    const watchedSource = watch("source") ?? "";

    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const hasFile = !!(watchedBanner && (watchedBanner as FileList).length > 0);

        if (!hasFile) {
            if (watchedSource.length > SOURCE_MAX) {
                setError("source", {
                    type: "manual",
                    message: `Max length is ${SOURCE_MAX} characters.`,
                });
            } else {
                clearErrors("source");
            }
            return;
        }

        if (watchedSource.trim().length < SOURCE_MIN) {
            setError("source", {
                type: "manual",
                message: `Source is required when an image is provided (${SOURCE_MIN}–${SOURCE_MAX} characters).`,
            });
        } else if (watchedSource.trim().length > SOURCE_MAX) {
            setError("source", {
                type: "manual",
                message: `Max length is ${SOURCE_MAX} characters.`,
            });
        } else {
            clearErrors("source");
        }
    }, [watchedBanner, watchedSource, setError, clearErrors]);

    useEffect(() => {
        if (!watchedBanner) return;
        const list = watchedBanner as FileList;
        if (!list || list.length === 0) {
            clearErrors("bannerInput");
            return;
        }
        const file = list[0];
        if (file.size > MAX_BYTES) {
            setError("bannerInput", {
                type: "manual",
                message: "File too large. Maximum allowed size is 30 MB.",
            });
        } else {
            clearErrors("bannerInput");
        }
    }, [watchedBanner]);

    const onSubmit = async (values: FormSchema) => {
        setBusy(true);
        clearErrors();

        try {
            const fileList: FileList | undefined = values.bannerInput;
            const hasFile = !!(fileList && fileList.length > 0);
            let bannerFileId: string | null = null;

            if (hasFile) {
                const file = fileList![0];

                if (file.size > MAX_BYTES) {
                    setError("bannerInput", {
                        type: "manual",
                        message: "File too large. Maximum allowed size is 30 MB.",
                    });
                    toast.error("File too large. Maximum allowed size is 30 MB.");
                    setBusy(false);
                    return;
                }

                const src = (values.source ?? "").trim();
                if (src.length < SOURCE_MIN || src.length > SOURCE_MAX) {
                    setError("source", {
                        type: "manual",
                        message: `Source is required when an image is provided (${SOURCE_MIN}–${SOURCE_MAX} characters).`,
                    });
                    toast.error(`Source must be ${SOURCE_MIN}-${SOURCE_MAX} characters when an image is provided.`);
                    setBusy(false);
                    return;
                }

                try {
                    const filePath = await uploadFile(file);
                    const parts = filePath.split("/");
                    bannerFileId = parts[parts.length - 1] || null;
                } catch (err) {
                    console.error("uploadFile error", err);
                    const msg = (err as Error).message || "Upload failed";
                    setError("bannerInput", { type: "manual", message: msg });
                    toast.error("Failed to upload image. Please try again.");
                    setBusy(false);
                    return;
                }
            } else {
                const src = (values.source ?? "").trim();
                if (src.length > SOURCE_MAX) {
                    setError("source", { type: "manual", message: `Max length is ${SOURCE_MAX} characters.` });
                    toast.error(`Max length is ${SOURCE_MAX} characters.`);
                    setBusy(false);
                    return;
                }
            }

            const visibility = values["radio-0"] === "public" ? "Public" : "Unlisted";

            const result = await publishBlog({
                userBlogId: blogId,
                bannerImageId: bannerFileId,
                imageSource: values.source?.trim() ?? null,
                visibility,
            });

            if (!result?.success) {
                const msg = result?.message ?? "Failed to publish";
                setError("source", { type: "manual", message: msg });
                toast.error(msg);
                setBusy(false);
                return;
            }

            toast.success(result.message ?? "Published successfully");
            reset();
        } catch (err) {
            console.error("Publish error", err);
            const msg = (err as Error).message ?? "Unexpected error";
            setError("source", { type: "manual", message: msg });
            toast.error(msg);
        } finally {
            setBusy(false);
        }
    };

    function onReset() {
        reset();
        clearErrors();
    }

    const sourceLen = (watchedSource ?? "").length;
    const hasFileNow = !!(watchedBanner && (watchedBanner as FileList).length > 0);
    const sourceInvalidBecauseMissingForFile = hasFileNow && sourceLen < SOURCE_MIN;
    const sourceTooLong = sourceLen > SOURCE_MAX;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} onReset={onReset} className="space-y-8 @container">
                <div className="grid grid-cols-12 gap-4">
                    <FormField
                        control={control}
                        name="bannerInput"
                        render={({ field }) => (
                            <FormItem className="col-span-12 flex flex-col gap-2 items-start">
                                <FormLabel className="flex shrink-0">Banner Image (optional)</FormLabel>
                                <div className="w-full">
                                    <FormControl>
                                        <Input
                                            key="file-input-0"
                                            type="file"
                                            accept=".jpg, .png, .webp, .jpeg"
                                            id="bannerInput"
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {errors.bannerInput?.message as string | undefined}
                                    </FormMessage>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="source"
                        render={({ field }) => (
                            <FormItem className="col-span-12 flex flex-col gap-2 items-start">
                                <FormLabel className="flex justify-between w-full items-center">
                                    <div>Source / Courtesy</div>
                                    <div
                                        className={`text-xs ${sourceTooLong || sourceInvalidBecauseMissingForFile ? "text-destructive" : "text-muted-foreground"
                                            }`}
                                    >
                                        {sourceLen} / {SOURCE_MAX}
                                    </div>
                                </FormLabel>

                                <div className="w-full">
                                    <FormControl>
                                        <Input
                                            {...field}
                                            key="text-input-0"
                                            placeholder="Photo by @hiteshchoudhary - Pexels"
                                            type="text"
                                            id="source"
                                            className="w-full"
                                            onChange={(e) => {
                                                field.onChange(e.target.value);
                                            }}
                                        />
                                    </FormControl>

                                    <FormMessage>
                                        {errors.source?.message as string | undefined}
                                        {!errors.source && sourceInvalidBecauseMissingForFile && (
                                            <span className="text-sm text-destructive">
                                                Source is required when an image is provided ({SOURCE_MIN}–{SOURCE_MAX} characters).
                                            </span>
                                        )}
                                        {!errors.source && sourceTooLong && (
                                            <span className="text-sm text-destructive">Maximum allowed length is {SOURCE_MAX} characters.</span>
                                        )}
                                    </FormMessage>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={"radio-0"}
                        render={({ field }) => (
                            <FormItem className="col-span-12 flex flex-col gap-2 items-start">
                                <FormLabel className="sr-only">Publish to</FormLabel>
                                <div className="w-full">
                                    <FormControl>
                                        <RadioGroup value={field.value} onValueChange={(v) => field.onChange(v)} className="w-full">
                                            <label className="flex items-start gap-3 p-2">
                                                <RadioGroupItem value="unlisted" id="radio-0-unlisted" />
                                                <div className="grid gap-1 leading-none">
                                                    <span className="font-medium">Unlisted</span>
                                                    <p className="text-sm text-muted-foreground">People with the link can read your blog</p>
                                                </div>
                                            </label>

                                            <label className="flex items-start gap-3 p-2">
                                                <RadioGroupItem value="public" id="radio-0-public" />
                                                <div className="grid gap-1 leading-none">
                                                    <span className="font-medium">Public</span>
                                                    <p className="text-sm text-muted-foreground">Everyone can read your blog</p>
                                                </div>
                                            </label>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage>{errors["radio-0"]?.message as string | undefined}</FormMessage>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormItem className="col-span-12 flex flex-col gap-2 items-start">
                        <FormLabel className="sr-only">Publish button</FormLabel>
                        <div className="w-full">
                            <FormControl>
                                <Button id="submit" name="submit" className="w-full" type="submit" variant="default" disabled={busy || isSubmitting}>
                                    {busy ? "Publishing..." : "Publish"}
                                </Button>
                            </FormControl>
                            <FormMessage />
                        </div>
                    </FormItem>
                </div>
            </form>
        </Form>
    );
}
