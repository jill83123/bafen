import { tagTable, workTable, workToTagTable } from '#server/db/schema';
import type { WorkCategory } from '#shared/constants/workCategory';
import { workCategories } from '#shared/constants/workCategory';
import { and, count, desc, eq } from 'drizzle-orm';

type TagItem = {
  id: number;
  name: string;
  workUsageCount: number;
};

type TagsByCategory = Record<WorkCategory, TagItem[]>;

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

  const tagsByCategory = workCategories.reduce((grouped, category) => {
    grouped[category] = [];
    return grouped;
  }, {} as TagsByCategory);

  for (const tag of rawTags) {
    if (!workCategories.includes(tag.category)) continue;
    tagsByCategory[tag.category as WorkCategory].push({
      id: tag.id,
      name: tag.name,
      workUsageCount: tag.workUsageCount,
    });
  }

  return {
    data: tagsByCategory,
  };
});
