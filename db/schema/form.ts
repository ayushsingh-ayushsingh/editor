import {
    pgTable,
    text,
    timestamp,
    uuid,
    jsonb,
} from "drizzle-orm/pg-core";

export const chapters = pgTable("chapters", {
    id: uuid("id").primaryKey().defaultRandom(),
    heading: text("heading").notNull().unique(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chapterContent = pgTable("chapter_content", {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id").notNull().references(() => chapters.id, {
        onDelete: "cascade",
    }),
    author: text("author").notNull(),
    summary: text("summary").notNull(),
    content: jsonb("content").notNull(),
    parsed: text("parsed_content").notNull(),
    date: text("date").notNull(),
    tags: text("tags").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
