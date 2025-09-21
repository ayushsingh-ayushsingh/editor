"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCommentsByPublishedId, addComment, editCommentById, deleteCommentById } from "../actions/comments";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Redo } from "lucide-react";

type CommentRow = {
    id: string;
    blogId: string;
    userEmail: string;
    parentCommentId?: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
};

interface Props {
    publishedId: string;
    sessionUserEmail?: string | null;
    sessionUserName?: string;
    sessionUserAvatar?: string;
}

export default function CommentsClient({ publishedId, sessionUserEmail, sessionUserName, sessionUserAvatar }: Props) {
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState("");

    async function fetchComments() {
        if (!publishedId) return;
        setLoading(true);
        try {
            const res = await getCommentsByPublishedId(publishedId);
            if (res?.success) {
                const normalized = (res.comments ?? []).map((c: any) => ({
                    ...c,
                    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
                    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
                }));
                setComments(normalized);
            } else {
                toast.error(res?.message ?? "Failed to fetch comments");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch comments");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publishedId]);

    async function handlePost() {
        if (!sessionUserEmail) {
            toast.error("Please login to comment.");
            return;
        }
        if (!publishedId) {
            toast.error("Post not published.");
            return;
        }
        if (!newComment.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }
        if (!sessionUserName) {
            toast.error("Comment cannot be empty.");
            return;
        }
        try {
            const res = await addComment(publishedId, sessionUserEmail, sessionUserName, newComment.trim(), sessionUserAvatar, replyTo ?? null);
            if (res?.success) {
                toast.success("Comment added");
                setNewComment("");
                setReplyTo(null);
                await fetchComments();
            } else {
                toast.error(res?.message ?? "Failed to add comment");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    }

    async function handleReply(id: string) {
        if (!sessionUserEmail) {
            toast.error("Please login to reply.");
            return;
        }
        setReplyTo(id);
        // optionally focus textarea
    }

    async function handleEdit(commentId: string) {
        if (!editingContent.trim()) {
            toast.error("Empty content");
            return;
        }
        try {
            const res = await editCommentById(commentId, sessionUserEmail ?? "", editingContent.trim());
            if (res?.success) {
                toast.success("Comment updated");
                setEditingId(null);
                setEditingContent("");
                await fetchComments();
            } else {
                toast.error(res?.message ?? "Failed to update");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update");
        }
    }

    async function handleDelete(commentId: string) {
        if (!sessionUserEmail) {
            toast.error("Please login to delete");
            return;
        }
        try {
            const res = await deleteCommentById(commentId, sessionUserEmail);
            if (res?.success) {
                toast.success("Comment deleted");
                await fetchComments();
            } else {
                toast.error(res?.message ?? "Failed to delete");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete");
        }
    }

    function buildTree(rows: CommentRow[]) {
        const map = new Map<string, CommentRow & { children?: any[] }>();
        rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
        const roots: (CommentRow & { children?: any[] })[] = [];
        for (const node of map.values()) {
            if (node.parentCommentId) {
                const parent = map.get(node.parentCommentId);
                if (parent) parent.children!.push(node);
                else roots.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    }

    function renderNode(node: any, depth = 0) {
        return (
            <div key={node.id} className="pl-2 pt-2 border-l-1" style={{ marginLeft: depth }}>
                <div className="flex items-start gap-3">
                    <Redo className="transform -scale-y-100 text-border rotate-6 -mx-3 mt-1" strokeWidth={1} />
                    {
                        node.userAvatar ?
                            <Image
                                src={node.userAvatar}
                                alt={node.userName || "User Avatar"}
                                height={32}
                                width={32}
                                className="w-9 h-9 rounded-full"
                            />
                            :
                            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                                {node.userEmail.charAt(0).toUpperCase()}
                            </div>
                    }
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">{node.userName}</div>
                            <div className="text-sm text-muted-foreground">{new Date(node.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="py-2">{node.content}</div>

                        <div className="flex items-center gap-1 my-1">
                            <Button size={"sm"} variant={"secondary"} className="text-sm cursor-pointer" onClick={() => handleReply(node.id)}>Reply</Button>
                            {sessionUserEmail === node.userEmail && (
                                <>
                                    <Button size={"sm"} variant={"secondary"} className="text-sm cursor-pointer" onClick={() => { setEditingId(node.id); setEditingContent(node.content); }}>
                                        Edit
                                    </Button>
                                    <Button size={"sm"} variant={"destructive"} className="text-sm cursor-pointer" onClick={() => void handleDelete(node.id)}>
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>

                        {editingId === node.id && (
                            <div className="mt-2">
                                <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                                <div className="flex gap-2 mt-2">
                                    <Button onClick={() => void handleEdit(node.id)}>Save</Button>
                                    <Button variant="secondary" onClick={() => { setEditingId(null); setEditingContent(""); }}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        {replyTo === node.id && (
                            <div className="my-2">
                                <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write reply..." />
                                <div className="flex gap-2 mt-2">
                                    <Button onClick={() => void handlePost()}>Reply</Button>
                                    <Button variant="secondary" onClick={() => { setReplyTo(null); setNewComment(""); }}>Cancel</Button>
                                </div>
                            </div>
                        )}

                        {node.children && node.children.map((c: any) => renderNode(c, depth + 1))}
                    </div>
                </div>
            </div>
        );
    }

    const tree = buildTree(comments);

    return (
        <div className="max-w-5xl mx-auto mt-6">
            <div className="font-medium mb-2">Comments</div>

            <div className="mb-4">
                <Textarea placeholder="What are your thoughts..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                <div className="flex justify-end gap-2 mt-2">
                    <Button onClick={() => void handlePost()}>Post</Button>
                    <Button variant="secondary" onClick={() => { setNewComment(""); setReplyTo(null); }}>Reset</Button>
                </div>
            </div>

            {loading ? (
                <div>Loading comments...</div>
            ) : (
                <div>
                    {tree.length === 0 ? <div className="text-sm text-muted-foreground">No comments yet.</div> : tree.map((n) => renderNode(n))}
                </div>
            )}
        </div>
    );
}
