"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"

import {
    getInitialContent,
    extractPlainTextFromBlocks
} from "../initialBlock"

const Editor = dynamic(() => import("./editor"), { ssr: false })

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpRight } from "lucide-react"

interface DialogProps {
    userName: string
    userEmail: string
    id: string
}

export default function ApiDialogTextEditor({ userName, userEmail, id }: DialogProps) {
    const [googleApiKey, setGoogleApiKey] = useState<string>("")
    const [open, setOpen] = useState<boolean>(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const storedKey = localStorage.getItem("googleApiKey")
        if (storedKey) {
            setGoogleApiKey(storedKey)
            setOpen(false)
        } else {
            setOpen(true)
        }
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedKey = googleApiKey.trim()
        if (trimmedKey) {
            try {
                localStorage.setItem("googleApiKey", trimmedKey)
                setGoogleApiKey(trimmedKey)
            } catch (err) {
                console.error("Failed to save API key to localStorage", err)
            }
            setOpen(false)
        }
    }

    const content = getInitialContent();
    const parsedContent = extractPlainTextFromBlocks(content);

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <form onSubmit={handleSubmit}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add Google API Key</DialogTitle>
                            <DialogDescription>
                                Add Google API key from{" "}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 mx-1 border-b border-primary pb-0"
                                >
                                    here
                                    <ArrowUpRight
                                        className="w-4 h-4 shrink-0 -ml-1"
                                        aria-hidden="true"
                                    />
                                </a>{" "}
                                to use AI assistant.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            <div className="grid gap-3">
                                <Label htmlFor="google-api-key">Google API Key</Label>
                                <Input
                                    id="google-api-key"
                                    name="google-api-key"
                                    value={googleApiKey}
                                    onChange={(e) => setGoogleApiKey(e.target.value)}
                                    className="selection:text-foreground"
                                    placeholder="Enter your Google API key"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleSubmit}>Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
            <Editor
                userName={userName}
                userEmail={userEmail}
                googleApiKey={googleApiKey}
                blogId={id}
                initialContent={content}
                initialParsedContent={parsedContent}
            />
        </div>
    )
}
