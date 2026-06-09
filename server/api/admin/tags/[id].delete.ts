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
  const param = getRouterParams(event);
  const paramParseResult = ParamSchema.safeParse(param);
  if (!paramParseResult.success) throw createError({ statusCode: 400 });

  const { id: tagId } = paramParseResult.data;

  // 檢查標籤是否存在
  const [existingTagById] = await db
    .select({ id: tagTable.id })
    .from(tagTable)
    .where(eq(tagTable.id, tagId));

  if (!existingTagById) throw createError({ statusCode: 404, message: '標籤不存在' });

  await db.delete(tagTable).where(eq(tagTable.id, tagId));

  return {};
});
