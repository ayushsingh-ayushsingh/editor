import { getBlogById } from "../actions/getBlogById";
import { redirect } from "next/navigation";
import BlogViewer from "./apiDialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { User, ThumbsUp, ThumbsDown, BanIcon, ArrowLeft } from "lucide-react";
import { getUserImageByEmail } from "../actions/getUserImageByEmail";
import Image from "next/image";
import { blog } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Utilities from "./utilityBanner";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export type BlogSelect = InferSelectModel<typeof blog>;

interface PageProps {
    params: { id: string };
}

export default async function Page({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const { id } = await params;
    const blog = await getBlogById(id);

    if (!blog?.blog?.content) {
        redirect("/404");
    }

    const userImageData = await getUserImageByEmail(blog.blog.email);
    const userImage = userImageData.userImage;

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
            <div className="max-w-5xl mx-auto -z-20 px-2">
                <div className="flex justify-between items-center">
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
                        {session ?
                            <div className="flex items-center">
                                <span className="truncate max-w-36 text-sm text-light">
                                    {session.user.name}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="link" size="icon" asChild className="mx-2">
                                            <Link href="/profile">
                                                {session.user.image ? (
                                                    <Image
                                                        src={session.user.image}
                                                        width={32}
                                                        height={32}
                                                        alt={session.user.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                                                        <User strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Profile</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            :
                            <div className="mx-2">
                                <Button asChild variant={"secondary"}>
                                    <Link href={"/login"}>
                                        Login
                                    </Link>
                                </Button>
                            </div>
                        }
                    </div>
                </div>
                <AspectRatio ratio={16 / 9} className="rounded mx-2">
                    <img
                        src="https://cdn.pixabay.com/photo/2025/05/30/17/15/mountains-9631825_1280.jpg"
                        alt="Photo by Drew Beamer"
                        className="h-full w-full object-cover dark:brightness-[0.9] rounded-lg"
                    />
                </AspectRatio>
                <LikeSubscribe userImage={userImage || ""} blog={blog.blog} />
                <Utilities content={blockContent} id={id} />
                <hr className="my-3 m-2" />
            </div>
            <BlogViewer
                content={blockContent}
            />
            <div className="max-w-5xl mx-auto p-4 -z-20">
                <hr className="my-3 m-2" />
                <LikeSubscribe userImage={userImage || ""} blog={blog.blog} />
                <hr className="my-3 m-2" />
                {
                    session ?
                        <div className="max-w-5xl mx-auto p-0 -z-20 my-4">
                            <div className="font-light text-secondary-foreground/80 border-l-4 mx-2 py-2 pl-2 flex items-center gap-2 justify-between flex-1 truncate">
                                Comment as {session.user.name}
                            </div>
                            <div className="mt-3 flex items-end mx-2 justify-between gap-3">
                                <Textarea placeholder="What are your thoughts..." />
                            </div>
                            <div className="mb-6 mt-3 flex items-end mx-2 justify-end gap-3">
                                <Button className="w-30" variant={"secondary"}>
                                    Post
                                </Button>
                            </div>
                        </div>
                        :
                        <div className="max-w-5xl mx-auto p-0 -z-20 my-4">
                            <div className=" font-light text-secondary-foreground/80 border-l-4 mx-2 p-2">
                                You may comment after you <Link href={"/login"} target="_blank" className="underline text-primary">
                                    Login
                                </Link>
                            </div>
                        </div>
                }
                <BlogComments />
                <Footer />
            </div>
        </div>
    );
}

export function Footer() {
    return (
        <div className="max-w-5xl mx-auto -z-20 mt-10 px-6 w-full text-center flex gap-6 justify-center mb-6 text-sm">
            <Link href={"/"} className="hover:underline underline-offset-2 text-center text-primary">
                Homepage
            </Link>
            <Link href={"/"} className="hover:underline underline-offset-2 text-center text-primary">
                Search
            </Link>
            <Link href={"/"} className="hover:underline underline-offset-2 text-center text-primary">
                Github
            </Link>
        </div>
    )
}

export function BlogComments() {
    const image = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Filarge.lisimg.com%2Fimage%2F887102%2F1118full-avatar-screenshot.jpg&f=1&nofb=1&ipt=b5493d628cfe85294c4e3f0482ed3e38bc5ee82d1bdc41cfe87dbbac3e7a2823";
    const commentBy = "Commenter Comments";
    const commentDate = "Sun Sep 14 2025";
    const commentContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum saepe suscipit praesentium laudantium quae dolor tempore possimus iure incidunt distinctio atque, repellendus molestias, laborum soluta doloribus id et totam omnis?";
    return (
        <div>
            <div className="w-full mx-2">
                <div className="flex items-center gap-3 underline-offset-2">
                    <div>
                        <Link href={"/"} className="hover:underline">
                            {image ? (
                                <Image
                                    src={image}
                                    width={32}
                                    height={32}
                                    alt={commentBy}
                                    className="w-9 h-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                                    <User strokeWidth={1.5} />
                                </div>
                            )}
                        </Link>
                    </div>
                    <div>
                        <Link href={"/"} className="hover:underline">
                            {commentBy}
                        </Link>
                        <div className="text-foreground/80 text-xs">
                            {commentDate}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-1 pl-14 py-2">
                {commentContent}
            </div>
        </div>
    )
}

interface LikeSubscribeProps {
    userImage: string;
    blog: BlogSelect;
}

export function LikeSubscribe({ userImage, blog }: LikeSubscribeProps) {
    return (
        <div>
            <div className="my-3 flex items-center justify-between py-1">
                <Link className="flex items-center gap-2 hover:underline underline-offset-2" href={"/"}>
                    <div className="mx-2">
                        {userImage ? (
                            <Image
                                src={userImage}
                                width={32}
                                height={32}
                                alt={`${blog.author}'s image`}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                                <User strokeWidth={1.5} />
                            </div>
                        )}
                    </div>
                    <span>
                        {blog.author}
                    </span>
                </Link>
                <Button className="w-30 mx-2" variant={"secondary"}>
                    Subscribe
                </Button>
            </div>
            <hr className="my-3 m-2" />
            <div className="mx-2 my-2 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="text-sm font-light text-secondary-foreground/80">
                        {blog.createdAt.toDateString()}
                    </div>
                </div>
                <div className="flex items-center">
                    <ToggleGroup type="single" className="w-19 flex gap-1">
                        <ToggleGroupItem value="like" className="rounded-md"><ThumbsUp /></ToggleGroupItem>
                        <ToggleGroupItem value="dislike" className="rounded-md"><ThumbsDown /></ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup type="single" className="w-9 flex ml-1">
                        <ToggleGroupItem value="ban" className="rounded-md"><BanIcon /></ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
        </div>
    )
}
