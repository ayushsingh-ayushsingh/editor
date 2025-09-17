"use client";

import dynamic from "next/dynamic";
import { Block } from "@blocknote/core";

const Viewer = dynamic(() => import("./viewer"), { ssr: false });

export default function BlogViewer({ content }: { content: string }) {
    const blockContent: Block[] = JSON.parse(content);
    return (
        <div>
            <Viewer initialContent={blockContent} />
        </div>
    );
}
