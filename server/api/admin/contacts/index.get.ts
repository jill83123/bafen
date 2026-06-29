import { PaginationShape } from '#server/schema';
import { db } from '@nuxthub/db';
import { contactTable } from '@nuxthub/db/schema';
import { count, desc } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
});

export default defineEventHandler(async (event) => {
  const { page: currentPage, page_size: pageSize } = await validateQuery(event, QuerySchema);
  const offset = (currentPage - 1) * pageSize;

  const [contacts, countSummary] = await Promise.all([
    db
      .select()
      .from(contactTable)
      .orderBy(desc(contactTable.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(contactTable.id) })
      .from(contactTable)
      .get(),
  ]);

  const totalPages = Math.ceil(countSummary!.total / pageSize);

  return {
    contacts,
    pagination: {
      currentPage,
      totalPages,
      hasPrePage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
});
