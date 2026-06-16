import { categories } from '#shared/constants/work';
import { db } from '@nuxthub/db';
import { tagTable, workTable, workToTagTable } from '@nuxthub/db/schema';
import { and, count, desc, eq } from 'drizzle-orm';

type Category = (typeof categories)[number];

type TagItem = {
  id: number;
  name: string;
  workUsageCount: number;
};

type TagsByCategory = Record<Category, TagItem[]>;

export default defineEventHandler(async () => {
  const rawTags = await db
    .select({
      id: tagTable.id,
      name: tagTable.name,
      category: workTable.category,
      workUsageCount: count(workToTagTable.workId),
    })
    .from(workToTagTable)
    .innerJoin(workTable, eq(workToTagTable.workId, workTable.id))
    .innerJoin(tagTable, eq(workToTagTable.tagId, tagTable.id))
    .where(and(eq(workTable.isPublic, true)))
    .groupBy(tagTable.id, tagTable.name, workTable.category)
    .orderBy(desc(count(workToTagTable.workId)));

  const tagsByCategory = categories.reduce((grouped, category) => {
    grouped[category] = [];
    return grouped;
  }, {} as TagsByCategory);

  for (const tag of rawTags) {
    tagsByCategory[tag.category as Category].push({
      id: tag.id,
      name: tag.name,
      workUsageCount: tag.workUsageCount,
    });
  }

  return {
    ...tagsByCategory,
  };
});
