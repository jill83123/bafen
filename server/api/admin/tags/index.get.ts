import { PaginationShape } from '#server/schema';
import { db } from '@nuxthub/db';
import { tagTable, workToTagTable } from '@nuxthub/db/schema';
import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
});

export default defineEventHandler(async (event) => {
  const { page: currentPage, page_size: pageSize } = await validateQuery(event, QuerySchema);
  const offset = (currentPage - 1) * pageSize;

  const [tags, countSummary] = await Promise.all([
    db
      .select({
        id: tagTable.id,
        name: tagTable.name,
        workUsageCount: count(workToTagTable.workId),
      })
      .from(tagTable)
      .leftJoin(workToTagTable, eq(workToTagTable.tagId, tagTable.id))
      .groupBy(tagTable.id, tagTable.name)
      .orderBy(desc(count(workToTagTable.workId)))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(tagTable.id) })
      .from(tagTable)
      .get(),
  ]);

  const totalPages = Math.ceil(countSummary!.total / pageSize);

  return {
    tags,
    pagination: {
      currentPage,
      totalPages,
      hasPrePage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
});
