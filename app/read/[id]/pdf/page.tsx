import React from "react";
import PDFViewerClient from "./pdfViewerClient";
import { getBlogById } from "../../actions/getPublishedBlogById";
import { redirect } from "next/navigation";

interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;
    const blog = await getBlogById(id);

    if (!blog?.blog?.content) {
        redirect("/404");
    }

    const blockContentString = blog.blog.content ?? "";

    try {
        JSON.parse(blockContentString);
    } catch (err) {
        console.error("Invalid blockContent JSON:", err);
        redirect("/404");
    }

    return <PDFViewerClient blockContentString={blockContentString} />;
}
