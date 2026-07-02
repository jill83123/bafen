import { UuidV4Schema } from '#server/schema';
import { db } from '@nuxthub/db';
import { tagTable, workTable, workToTagTable } from '@nuxthub/db/schema';
import { eq, notExists } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({
  id: UuidV4Schema,
});

export default defineEventHandler(async (event) => {
  const { id: workId } = await validateParams(event, ParamSchema);

  // 檢查作品是否存在
  const [work] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(eq(workTable.id, workId));

  if (!work) throw createError({ statusCode: 404, message: '作品不存在' });

  await db.batch([
    db.delete(workTable).where(eq(workTable.id, workId)),

    // 清理未使用的標籤
    db
      .delete(tagTable)
      .where(
        notExists(db.select().from(workToTagTable).where(eq(workToTagTable.tagId, tagTable.id))),
      ),
  ]);

  return {};
});
