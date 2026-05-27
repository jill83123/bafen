import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { timestamp, uuid } from './_utils';
import { imageTable, tagTable } from './index';

export const workTable = sqliteTable('work', {
  id: uuid('id'),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  coverId: text('cover_id')
    .notNull()
    .references(() => imageTable.id),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

export const workToImageTable = sqliteTable(
  'work_to_image',
  {
    workId: text('work_id')
      .notNull()
      .references(() => workTable.id, { onDelete: 'cascade' }),
    imageId: text('image_id')
      .notNull()
      .references(() => imageTable.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.workId, table.imageId] })],
);

export const workToTagTable = sqliteTable(
  'work_to_tag',
  {
    workId: text('work_id')
      .notNull()
      .references(() => workTable.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tagTable.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.workId, table.tagId] })],
);
