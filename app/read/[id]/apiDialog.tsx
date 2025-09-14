"use client";

import dynamic from "next/dynamic";

const Viewer = dynamic(() => import("./viewer"), { ssr: false });

export default function BlogViewer({ content }: { content: string }) {
    const blockContent = JSON.parse(content);

    return (
        <div>
            <Viewer initialContent={blockContent} />
        </div>
    );
}
