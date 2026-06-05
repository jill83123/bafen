import { tagTable, workToTagTable } from '#server/db/schema';
import { PaginationShape } from '#server/schema';
import { count, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queryParseResult = QuerySchema.safeParse(query);
  if (!queryParseResult.success) throw createError({ statusCode: 400 });

  const currentPage = queryParseResult.data.page;
  const pageSize = queryParseResult.data.page_size;
  const offset = (currentPage - 1) * pageSize;

  const [tags, [countSummary]] = await Promise.all([
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

    db.select({ total: count(tagTable.id) }).from(tagTable),
  ]);

  const totalPages = Math.ceil(countSummary.total / pageSize);

  return {
    data: {
      tags,
      pagination: {
        currentPage,
        totalPages,
        hasPrePage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
    },
  };
});
