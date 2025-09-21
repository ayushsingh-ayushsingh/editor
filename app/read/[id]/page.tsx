import React from "react";
import { getPublishedBlogByUserBlogId } from "../actions/getPublishedBlogByUserBlogId";
import { redirect } from "next/navigation";
import BlogViewer from "./apiDialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { User, ArrowLeft } from "lucide-react";
import { getUserImageByEmail } from "../actions/getUserImageByEmail";
import Image from "next/image";
import { InferSelectModel } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Utilities from "./utilityBanner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import LikeSubscribeClient from "./likeSubscribe";
import CommentsClient from "./comments";

import { blog as BlogTable, publishedBlogs as PublishedTable } from "@/db/schema";

export type BlogSelect = InferSelectModel<typeof BlogTable>;
export type PublishedSelect = InferSelectModel<typeof PublishedTable>;

interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { id } = await params;

    const res = await getPublishedBlogByUserBlogId(id);
    const published: PublishedSelect | null = res.published ?? null;

    if (!published) {
        redirect("/404");
    }

    const userImageData = await getUserImageByEmail(published.email);
    const userImage = userImageData.userImage ?? "";

    const blockContent = published.content ?? "";
    const author = published.author ?? "Unknown";
    const createdAt = published.publishedAt;

    return (
        <div>
            <div className="max-w-5xl mx-auto px-2">
                <div className="flex justify-between items-center py-3">
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

                    <div className="py-2">
                        {session ? (
                            <div className="flex items-center gap-2">
                                <span className="truncate max-w-36 text-sm text-light">
                                    {session.user.name}
                                </span>
                                <Link href="/profile" className="mx-2 inline-block">
                                    {session.user.image ? (
                                        <Image
                                            src={session.user.image}
                                            width={32}
                                            height={32}
                                            alt={session.user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                                            <User strokeWidth={1.5} />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="mx-2">
                                <Button asChild variant={"secondary"}>
                                    <Link href={"/login"}>Login</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <AspectRatio ratio={16 / 9} className="rounded">
                    <img
                        src={
                            published.bannerImage
                                ? `/api/files/${published.bannerImage}`
                                : "https://cdn.pixabay.com/photo/2025/05/30/17/15/mountains-9631825_1280.jpg"
                        }
                        alt={published.heading ?? "cover"}
                        className="h-full w-full object-cover rounded-lg"
                    />
                </AspectRatio>

                <LikeSubscribeClient
                    publishedId={published.id}
                    initialLikes={published.likesCount ?? 0}
                    initialDislikes={published.dislikesCount ?? 0}
                    userImage={userImage}
                    author={author}
                    createdAt={createdAt}
                    sessionUserEmail={session?.user?.email ?? null}
                />

                <Utilities content={blockContent} id={id} />

                <hr className="my-3" />
            </div>

            <BlogViewer content={blockContent} />

            <div className="max-w-5xl mx-auto p-4">
                {session ? (
                    <CommentsClient
                        publishedId={published.id}
                        sessionUserEmail={session.user.email}
                        sessionUserName={session.user.name}
                        sessionUserAvatar={session.user.image || undefined}
                    />
                ) : (
                    <div className="py-4">
                        You may comment after you{" "}
                        <Link href="/login" target="_blank" className="underline text-primary">
                            Login
                        </Link>
                        <CommentsClient
                            publishedId={published.id}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
