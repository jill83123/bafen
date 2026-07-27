import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp, uuid } from './_utils';

export const imageTable = sqliteTable('image', {
  id: uuid('id'),
  storageKey: text('storage_key').notNull().unique(),
  size: integer('size').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  createdAt: timestamp('created_at'),
});
