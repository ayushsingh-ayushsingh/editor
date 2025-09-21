"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, BanIcon } from "lucide-react";
import { likePublishedBlog, dislikePublishedBlog } from "../actions/reactions";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Props {
    publishedId: string | null;
    initialLikes?: number;
    initialDislikes?: number;
    userImage?: string;
    author?: string;
    createdAt?: string | Date;
    sessionUserEmail?: string | null;
}

export default function LikeSubscribeClient({
    publishedId,
    initialLikes = 0,
    initialDislikes = 0,
    userImage,
    author,
    createdAt,
    sessionUserEmail,
}: Props) {
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [busy, setBusy] = useState(false);
    const [selected, setSelected] = useState<"like" | "dislike" | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        setLikes(initialLikes);
    }, [initialLikes]);
    useEffect(() => {
        setDislikes(initialDislikes);
    }, [initialDislikes]);

    async function handleLike() {
        if (!publishedId) return toast.error("This post is not published yet.");
        if (!sessionUserEmail) return toast.error("Please login to like.");

        setBusy(true);
        try {
            const res = await likePublishedBlog(publishedId, sessionUserEmail);
            if (!res?.success) {
                toast.error(res?.message ?? "Failed to toggle like");
            } else {
                setLikes(res.likesCount ?? likes);
                if (res.dislikesCount !== undefined && res.dislikesCount !== null) setDislikes(res.dislikesCount);
                setSelected(res.action === "liked" ? "like" : null);
                toast.success(res.message ?? "Updated");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to toggle like");
        } finally {
            setBusy(false);
        }
    }

    async function handleDislike() {
        if (!publishedId) return toast.error("This post is not published yet.");
        if (!sessionUserEmail) return toast.error("Please login to dislike.");

        setBusy(true);
        try {
            const res = await dislikePublishedBlog(publishedId, sessionUserEmail);
            if (!res?.success) {
                toast.error(res?.message ?? "Failed to toggle dislike");
            } else {
                setLikes(res.likesCount ?? likes);
                if (res.dislikesCount !== undefined && res.dislikesCount !== null) setDislikes(res.dislikesCount);
                setSelected(res.action === "disliked" ? "dislike" : null);
                toast.success(res.message ?? "Updated");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to toggle dislike");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <div className="my-3 flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                    {userImage ? (
                        <Image src={userImage} width={36} height={36} alt={`${author ?? "author"}'s avatar`} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                            {author?.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="text">
                        <div className="font-medium">{author}</div>
                    </div>
                </div>

                {
                    isSubscribed ?
                        <Button className="py-5" variant={"secondary"} onClick={() => setIsSubscribed(false)}>
                            Unsubscribe
                        </Button>
                        :
                        <Button className="py-5" onClick={() => setIsSubscribed(true)}>
                            Subscribe
                        </Button>
                }
            </div>

            <hr className="my-3" />
            <div className="flex justify-between items-center px-2">
                <div className="text-sm text-muted-foreground">{createdAt ? new Date(createdAt).toDateString() : ""}</div>
                <div className="flex items-center gap-2">
                    <ToggleGroup type="single" className="gap-2">
                        <ToggleGroupItem value="like" className="rounded-md flex px-3 gap-2" onClick={handleLike}>
                            <ThumbsUp />
                            <span>
                                {likes}
                            </span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="dislike" className="rounded-md flex px-3 gap-2" onClick={handleDislike}>
                            <ThumbsDown />
                            <span>
                                {dislikes}
                            </span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
        </div>
    );
}
