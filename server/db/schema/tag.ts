import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from './_utils';

export const tagTable = sqliteTable('tag', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
