import { pgTable, uuid, text, customType } from "drizzle-orm/pg-core";

export const bytea = customType<{ data: Buffer }>({
    dataType() {
        return 'bytea';
    },
});

export const files = pgTable('files', {
    id: uuid('id').primaryKey().defaultRandom(),
    filename: text('filename').notNull(),
    mimetype: text('mimetype').notNull(),
    data: bytea('data').notNull(),
});
