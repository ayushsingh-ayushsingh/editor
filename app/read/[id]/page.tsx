import { getBlogById } from "../actions/getBlogById";
import BlogViewer from "./apiDialog";
import { redirect } from "next/navigation";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Heart, Ban, User } from "lucide-react";
import { getUserImageByEmail } from "../actions/getUserImageByEmail";
import Image from "next/image";
import { blog } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Textarea } from "@/components/ui/textarea"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export type BlogSelect = InferSelectModel<typeof blog>;

interface LikeSubscribeProps {
    userImage: string;
    blog: BlogSelect;
}

export function LikeSubscribe({ userImage, blog }: LikeSubscribeProps) {
    return (
        <div>
            <div className="my-3 flex items-center justify-between">
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
            <div className="mx-2 my-2 flex justify-between items-center">
                <div className="flex items-center">
                    <div className="text-sm font-light text-secondary-foreground/80">
                        {blog.createdAt.toDateString()}
                    </div>
                </div>
                <div className="flex items-center">
                    <Button className="w-10 hover:bg-accent bg-secondary flex items-center justify-center">
                        <Heart fill="red" stroke="#7c7c7c" strokeWidth={0.1} />
                    </Button>
                    <Button className="w-10 hover:bg-accent bg-secondary flex items-center justify-center">
                        <Heart fill="black" stroke="#7c7c7c" strokeWidth={0.1} />
                    </Button>
                    <Button className="w-10 hover:bg-accent bg-secondary flex items-center justify-center">
                        <Ban stroke="black" strokeWidth={3} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

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
            <div className="max-w-5xl mx-auto p-4 -z-20 mt-2">
                <AspectRatio ratio={16 / 9}>
                    <img
                        src="https://cdn.pixabay.com/photo/2025/05/30/17/15/mountains-9631825_1280.jpg"
                        alt="Photo by Drew Beamer"
                        className="h-full w-full object-cover dark:brightness-[0.9] px-2"
                    />
                </AspectRatio>
                <LikeSubscribe userImage={userImage || ""} blog={blog.blog} />
                <hr className="my-3 m-2" />
            </div>
            <BlogViewer
                content={blockContent}
            />
            <div className="max-w-5xl mx-auto p-4 -z-20 mt-2">
                <hr className="my-3 m-2" />
                <LikeSubscribe userImage={userImage || ""} blog={blog.blog} />
                <hr className="my-3 m-2" />
                {
                    session ?
                        <div className="max-w-5xl mx-auto p-0 -z-20 mt-2">
                            <div className="font-light text-secondary-foreground/80 border-l-4 mx-2 p-2 flex items-center gap-2 justify-between">
                                Comment as {session.user.name}
                            </div>
                            <div className="my-3 flex items-end mx-2 justify-between gap-3">
                                <Textarea className="border border-primary/50" placeholder="What are your thoughts..." />
                                <Button className="w-30" variant={"secondary"}>
                                    Comment
                                </Button>
                            </div>
                        </div>
                        :
                        <div className="max-w-5xl mx-auto p-0 -z-20 mt-2">
                            <div className=" font-light text-secondary-foreground/80 border-l-4 mx-2 p-2">
                                Comment after you <Link href={"/login"} className="underline text-primary">
                                    Login here
                                </Link>
                            </div>
                            <div className="my-3 flex items-end justify-between">
                                <Textarea className="border mx-2 border-primary/50" placeholder="What are your thoughts..." />
                                <Button className="w-30 mx-2" variant={"secondary"}>
                                    Comment
                                </Button>
                            </div>
                        </div>
                }
                <Link className="mx-2 flex items-center gap-3 hover:underline underline-offset-2" href={"/"}>
                    <div>
                        {session?.user.image ? (
                            <Image
                                src={session?.user.image}
                                width={32}
                                height={32}
                                alt="User Image"
                                className="w-9 h-9 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                                <User strokeWidth={1.5} />
                            </div>
                        )}
                    </div>
                    <div className="w-40 truncate">
                        Ayush Singh adfjkl
                    </div>
                </Link>
                <div className="flex-1 pl-14">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum accusantium molestiae facere est illo inventore dolorem ratione aut, consequuntur assumenda, aspernatur ab corrupti.
                </div>
            </div>
        </div>
    );
}
