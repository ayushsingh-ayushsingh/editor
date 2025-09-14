import React from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Publish({ id }: { id: string | null }) {

    if (!id) {
        return;
    }

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="secondary" size={"icon"}>
                        <Send strokeWidth={1} />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md z-100">
                    <DialogHeader>
                        <DialogTitle>Share link</DialogTitle>
                        <DialogDescription>
                            Anyone who has this link will be able to view this.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">
                                Link
                            </Label>
                            <Input
                                id="link"
                                className='selection:text-foreground'
                                defaultValue="https://ui.shadcn.com/docs/installation"
                            />
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
