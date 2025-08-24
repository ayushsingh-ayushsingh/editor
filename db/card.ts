// app/db/schema/card.ts
import {
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "@/db/schema";

export const card = pgTable("card", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),

  // FK to user who created the card
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
