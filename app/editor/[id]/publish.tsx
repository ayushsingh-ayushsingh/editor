import React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import GeneratedForm from "./publishForm";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function Publish({ id }: { id: string | null }) {
    if (!id) {
        return null;
    }

    return (
        <div>
            <Dialog>
                <Tooltip>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button variant="secondary" size={"icon"}>
                                <Send strokeWidth={1.5} />
                            </Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent>
                        <p>Share</p>
                    </TooltipContent>
                </Tooltip>

                <DialogContent className="sm:max-w-md z-100">
                    <DialogHeader>
                        <DialogTitle>Publish your creation</DialogTitle>
                    </DialogHeader>

                    <GeneratedForm blogId={id} />

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full" type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
