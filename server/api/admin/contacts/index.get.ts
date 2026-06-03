import { contactTable } from '#server/db/schema';
import { PaginationShape } from '#server/schema';
import { countDistinct, desc } from 'drizzle-orm';
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

  const [contacts, [countSummary]] = await Promise.all([
    db
      .select()
      .from(contactTable)
      .orderBy(desc(contactTable.createdAt))
      .limit(pageSize)
      .offset(offset),

    db.select({ total: countDistinct(contactTable.id) }).from(contactTable),
  ]);

  const totalPages = Math.ceil(countSummary.total / pageSize);

  return {
    data: {
      contacts,
      pagination: {
        currentPage,
        totalPages,
        hasPrePage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
    },
  };
});
