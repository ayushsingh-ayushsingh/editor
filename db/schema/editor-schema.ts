import {
    pgTable,
    text,
    timestamp,
    uuid,
    jsonb,
    primaryKey,
    pgEnum
} from "drizzle-orm/pg-core";

export const pageStatusEnum = pgEnum("page_status", ["private", "unlisted", "published"]);

export const pageData = pgTable("page_data", {
    id: uuid("id").primaryKey(),
    heading: text("heading").notNull(),
    author: text("author").notNull(),
    email: text("email").notNull(),
    summary: text("summary"),
    content: jsonb("content").notNull(),
    parsedContent: text("parsed_content").notNull(),
    date: text("date").notNull(),
    status: pageStatusEnum("status").default("private").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
    id: uuid("id").primaryKey(),
    tag: text("tag").notNull().unique(),
});

export const pageTags = pgTable(
    "page_tags",
    {
        pageId: uuid("page_id").notNull().references(() => pageData.id, {
            onDelete: "cascade",
        }),
        tagId: uuid("tag_id").notNull().references(() => tags.id, {
            onDelete: "cascade",
        }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.pageId, table.tagId] }),
    })
);

export const editorSchema = { pageData, tags, pageTags, pageStatusEnum };
