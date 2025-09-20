import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersBlogs = pgTable("users_blogs", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  heading: text("heading").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const blog = pgTable("blog", {
  id: uuid("id").primaryKey(),
  userBlogId: uuid("user_blog_id").references(() => usersBlogs.id, { onDelete: 'cascade' }).notNull(),
  author: text("author").notNull(),
  email: text("email").notNull(),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  parsed: text("parsed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
