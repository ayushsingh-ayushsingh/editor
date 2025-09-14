import { getBlogById } from "../actions/getBlogById";
import BlogViewer from "./apiDialog";
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

    let blockContent = "";
    let parsed = "";

    try {
        blockContent = blog.blog.content;
        parsed = blog.blog.parsed;
    } catch (err) {
        console.error("Failed to parse blog content:", err);
        redirect("/404");
    }

    return (
        <div>
            <div className="max-w-md mx-auto p-4 hidden">
                {parsed}
            </div>
            <BlogViewer
                content={blockContent}
            />
        </div>
    );
}
