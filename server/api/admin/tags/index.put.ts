import { db } from '@nuxthub/db';
import { tagTable } from '@nuxthub/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';

const BodySchema = z.object({
  id: z.number(),
  name: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const { id: tagId, name: tagName } = await validateBody(event, BodySchema);

  // 檢查標籤是否存在
  const [existingTagById] = await db
    .select({ id: tagTable.id })
    .from(tagTable)
    .where(eq(tagTable.id, tagId));

  if (!existingTagById) throw createError({ statusCode: 404, message: '標籤不存在' });

  // 確保名稱唯一（原本的名稱可通過）
  const [existingTagByName] = await db
    .select({ id: tagTable.id })
    .from(tagTable)
    .where(and(eq(tagTable.name, tagName), ne(tagTable.id, tagId)));

  if (existingTagByName) {
    throw createError({ statusCode: 400, message: '標籤已存在，請輸入其他名稱' });
  }

  await db
    .update(tagTable)
    .set({
      name: tagName,
      updatedAt: new Date(),
    })
    .where(eq(tagTable.id, tagId));

  return {};
});
