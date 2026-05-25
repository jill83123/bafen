import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp } from './_utils';

export const contactTable = sqliteTable('contact', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  tel: text('tel').notNull(),
  address: text('address').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at'),
});
