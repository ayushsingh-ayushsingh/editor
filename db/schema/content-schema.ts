import {
    pgTable,
    uuid,
    text,
    timestamp,
    index,
} from "drizzle-orm/pg-core";
import { pageStatusEnum } from "./editor-schema";
import { pageData } from "./editor-schema";

export const content = pgTable("content", {
    id: uuid("id").primaryKey().defaultRandom(),
    heading: text("heading").notNull(),
    email: text("email").notNull(),
    status: pageStatusEnum("status").default("private").notNull(),
    pageId: uuid("page_id")
        .notNull()
        .references(() => pageData.id, {
            onDelete: "cascade",
        }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    emailIdx: index("content_email_idx").on(table.email),
    statusIdx: index("content_status_idx").on(table.status),
    pageIdx: index("content_page_id_idx").on(table.pageId),
}));
