import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp, uuid } from './_utils';

export const imageTable = sqliteTable('image', {
  id: uuid('id'),
  storageKey: text('storage_key').notNull().unique(),
  size: integer('size').notNull(),
  createdAt: timestamp('created_at'),
});
