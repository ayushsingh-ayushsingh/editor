import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    foreignKey,
} from "drizzle-orm/pg-core";

import { files } from "./file";
import { usersBlogs } from "./blog";

export const publishedBlogs = pgTable("published_blogs", {
    id: uuid("id").primaryKey().defaultRandom(),

    bannerImage: uuid("banner_image").references(() => files.id, { onDelete: "set null" }),
    imageSource: text("image_source"),

    visibility: text("visibility").$type<"Unlisted" | "Public">().notNull().default("Public"),

    sourceUserBlogId: uuid("source_user_blog_id").references(() => usersBlogs.id, { onDelete: "set null" }).notNull(),

    author: text("author").notNull(),
    email: text("email").notNull(),
    heading: text("heading").notNull(),
    content: text("content").notNull(),
    parsed: text("parsed").notNull(),

    likesCount: integer("likes_count").default(0).notNull(),
    dislikesCount: integer("dislikes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),

    publishedAt: timestamp("published_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const blogLikes = pgTable("blog_likes", {
    id: uuid("id").primaryKey().defaultRandom(),
    blogId: uuid("blog_id")
        .references(() => publishedBlogs.id, { onDelete: "cascade" })
        .notNull(),
    userEmail: text("user_email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogDislikes = pgTable("blog_dislikes", {
    id: uuid("id").primaryKey().defaultRandom(),
    blogId: uuid("blog_id")
        .references(() => publishedBlogs.id, { onDelete: "cascade" })
        .notNull(),
    userEmail: text("user_email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogComments = pgTable(
    "blog_comments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        blogId: uuid("blog_id")
            .references(() => publishedBlogs.id, { onDelete: "cascade" })
            .notNull(),

        userEmail: text("user_email").notNull(),
        userName: text("user_name").notNull(),
        userAvatar: text("user_avatar"),
        parentCommentId: uuid("parent_comment_id"),
        content: text("content").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        foreignKey({
            name: "fk_parent_comment",
            columns: [table.parentCommentId],
            foreignColumns: [table.id],
        }).onDelete("cascade"),
    ]
);
