import { PaginationShape } from '#server/schema';
import { db } from '@nuxthub/db';
import { imageTable, workToImageTable } from '@nuxthub/db/schema';
import { and, count, desc, eq, isNotNull, isNull, sum } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
  is_used: z.enum(['true', 'false', '']).optional().default(''),
});

export default defineEventHandler(async (event) => {
  const {
    page: currentPage,
    page_size: pageSize,
    is_used: isUsed,
  } = await validateQuery(event, QuerySchema);

  const offset = (currentPage - 1) * pageSize;

  const whereConditions = [];
  if (isUsed === 'true') whereConditions.push(isNotNull(workToImageTable.imageId));
  else if (isUsed === 'false') whereConditions.push(isNull(workToImageTable.imageId));

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  const [images, countSummary, sizeSummary] = await Promise.all([
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
      .select({ total: count(imageTable.id) })
      .from(imageTable)
      .leftJoin(workToImageTable, eq(imageTable.id, workToImageTable.imageId))
      .where(whereClause)
      .get(),

    db
      .select({ total: sum(imageTable.size) })
      .from(imageTable)
      .get(),
  ]);

  const totalPages = Math.ceil(countSummary!.total / pageSize);

  const MAX_SIZE_BYTES = 10 * 1024 ** 3;
  const totalSize = Number(sizeSummary?.total ?? 0);
  const usedPercent = totalSize ? Math.round((totalSize / MAX_SIZE_BYTES) * 100) : 0;

  const formatSize = (bytes: number) => {
    const gb = bytes / 1024 ** 3;
    if (gb >= 1) return Number.isInteger(gb) ? `${gb} GB` : `${gb.toFixed(2)} GB`;

    const mb = bytes / 1024 ** 2;
    return Number.isInteger(mb) ? `${mb} MB` : `${mb.toFixed(2)} MB`;
  };

  const totalSizeText = formatSize(totalSize);
  const maxSizeText = formatSize(MAX_SIZE_BYTES);

  return {
    images,
    pagination: {
      currentPage,
      totalPages,
      hasPrePage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
    totalSizeText,
    maxSizeText,
    usedPercent,
  };
});
