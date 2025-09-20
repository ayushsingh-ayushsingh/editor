// db/schema/publish.ts
import {
    pgTable,
    text,
    timestamp,
    uuid,
    integer,
    foreignKey,
} from "drizzle-orm/pg-core";

import { usersBlogs } from "./blog";
import { files } from "./file";
import { user } from "./auth-schema";

export const publishedBlogs = pgTable("published_blogs", {
    id: uuid("id").primaryKey().defaultRandom(),
    userBlogId: uuid("user_blog_id")
        .references(() => usersBlogs.id, { onDelete: "cascade" })
        .notNull(),

    bannerImage: uuid("banner_image")
        .references(() => files.id, { onDelete: "set null" }),
    imageSource: text("image_source"),

    visibility: text("visibility")
        .$type<"Unlisted" | "Public">()
        .notNull()
        .default("Public"),

    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    publishedAt: timestamp("published_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogLikes = pgTable("blog_likes", {
    id: uuid("id").primaryKey().defaultRandom(),
    blogId: uuid("blog_id")
        .references(() => publishedBlogs.id, { onDelete: "cascade" })
        .notNull(),
    userId: text("user_id")
        .references(() => user.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogComments = pgTable(
    "blog_comments",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        blogId: uuid("blog_id")
            .references(() => publishedBlogs.id, { onDelete: "cascade" })
            .notNull(),
        userId: text("user_id")
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
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
