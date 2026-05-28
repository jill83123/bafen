import { contactTable } from '#server/db/schema';
import { countDistinct, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const currentPage = parseInt(query.page as string) || 1;
  const pageSize = parseInt(query.page_size as string) || 10;
  const offset = (currentPage - 1) * pageSize;

  const contacts = await db
    .select()
    .from(contactTable)
    .orderBy(desc(contactTable.createdAt))
    .limit(pageSize)
    .offset(offset);

  // 計算總頁數
  const [countSummary] = await db
    .select({ total: countDistinct(contactTable.id) })
    .from(contactTable);

  const totalCount = Number(countSummary?.total || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    message: '資料取得成功',
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
