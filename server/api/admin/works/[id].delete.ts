import { tagTable, workTable, workToTagTable } from '#server/db/schema';
import { UuidV4Schema } from '#server/schema';
import { eq, notExists } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({
  id: UuidV4Schema,
});

export default defineEventHandler(async (event) => {
  const param = getRouterParams(event);
  const paramParseResult = ParamSchema.safeParse(param);
  if (!paramParseResult.success) throw createError({ statusCode: 400 });

  const { id: workId } = paramParseResult.data;

  // 檢查作品是否存在
  const [work] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(eq(workTable.id, workId));

  if (!work) throw createError({ statusCode: 404, message: '作品不存在' });

  await db.transaction(async (tx: typeof db) => {
    await tx.delete(workTable).where(eq(workTable.id, workId));

    // 清理未使用的標籤
    await tx
      .delete(tagTable)
      .where(
        notExists(tx.select().from(workToTagTable).where(eq(workToTagTable.tagId, tagTable.id))),
      );
  });

  return {};
});
