import { imageTable, workToImageTable } from '#server/db/schema';
import { and, countDistinct, desc, eq, isNotNull, isNull, sum } from 'drizzle-orm';

type FilterStatus = 'used' | 'unused' | 'all';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const currentPage = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.page_size as string) || 10;
  const offset = (currentPage - 1) * pageSize;
  let filterStatus = (query.filter as FilterStatus) || '';

  const whereConditions = [];
  if (filterStatus === 'unused') whereConditions.push(isNull(workToImageTable.imageId));
  else if (filterStatus === 'used') whereConditions.push(isNotNull(workToImageTable.imageId));
  else filterStatus = 'all';

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  const images = await db
    .select({ id: imageTable.id, path: imageTable.storageKey })
    .from(imageTable)
    .leftJoin(workToImageTable, eq(imageTable.id, workToImageTable.imageId))
    .where(whereClause)
    .groupBy(imageTable.id)
    .orderBy(desc(imageTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  // 計算總頁數
  const [countSummary] = await db
    .select({ total: countDistinct(imageTable.id) })
    .from(imageTable)
    .leftJoin(workToImageTable, eq(imageTable.id, workToImageTable.imageId))
    .where(whereClause);

  const totalCount = Number(countSummary?.total || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // 計算總大小
  const [sizeSummary] = await db.select({ total: sum(imageTable.size) }).from(imageTable);

  const totalSize = Number(sizeSummary?.total || 0);
  const totalSizeText =
    totalSize >= 1024 ** 3
      ? `${(totalSize / 1024 ** 3).toFixed(2)} GB`
      : `${(totalSize / 1024 ** 2).toFixed(2)} MB`;

  return {
    message: '圖片取得成功',
    data: {
      filterStatus,
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
