import { imageTable, workToImageTable } from '#server/db/schema';
import { PaginationShape } from '#server/schema';
import { and, countDistinct, desc, eq, isNotNull, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
  is_used: z.enum(['true', 'false', '']).optional().default(''),
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queryParseResult = QuerySchema.safeParse(query);
  if (!queryParseResult.success) throw createError({ statusCode: 400 });

  const currentPage = queryParseResult.data.page;
  const pageSize = queryParseResult.data.page_size;
  const offset = (currentPage - 1) * pageSize;
  const isUsed = queryParseResult.data.is_used;

  const whereConditions = [];
  if (isUsed === 'true') whereConditions.push(isNotNull(workToImageTable.imageId));
  else if (isUsed === 'false') whereConditions.push(isNull(workToImageTable.imageId));

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  const [images, [countSummary], [sizeSummary]] = await Promise.all([
    db
      .select({ id: imageTable.id, path: imageTable.storageKey })
      .from(imageTable)
      .leftJoin(workToImageTable, eq(imageTable.id, workToImageTable.imageId))
      .where(whereClause)
      .groupBy(imageTable.id)
      .orderBy(desc(imageTable.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: countDistinct(imageTable.id) })
      .from(imageTable)
      .leftJoin(workToImageTable, eq(imageTable.id, workToImageTable.imageId))
      .where(whereClause),

    db.select({ total: sum(imageTable.size) }).from(imageTable),
  ]);

  const totalCount = Number(countSummary?.total || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  const totalSize = Number(sizeSummary?.total || 0);
  const totalSizeText =
    totalSize >= 1024 ** 3
      ? `${(totalSize / 1024 ** 3).toFixed(2)} GB`
      : `${(totalSize / 1024 ** 2).toFixed(2)} MB`;

  return {
    data: {
      images,
      pagination: {
        currentPage,
        totalPages,
        hasPrePage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      totalSizeText,
      maxSizeText: '10 GB',
    },
  };
});
