import { db } from '@nuxthub/db';
import { tagTable } from '@nuxthub/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d*$/)
    .transform((value) => Number(value)),
});

export default defineEventHandler(async (event) => {
  const { id: tagId } = await validateParams(event, ParamSchema);

  // 檢查標籤是否存在
  const [existingTagById] = await db
    .select({ id: tagTable.id })
    .from(tagTable)
    .where(eq(tagTable.id, tagId));

  if (!existingTagById) throw createError({ statusCode: 404, message: '標籤不存在' });

  await db.delete(tagTable).where(eq(tagTable.id, tagId));

  setResponseStatus(event, 204);
  return null;
});
