import { imageTable, workTable, workToImageTable } from '#server/db/schema';
import { UuidV4Schema } from '#server/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({ id: UuidV4Schema });

export default defineEventHandler(async (event) => {
  const param = getRouterParams(event);
  const paramParseResult = ParamSchema.safeParse(param);
  if (!paramParseResult.success) throw createError({ statusCode: 400 });

  const { id: imageId } = paramParseResult.data;

  const [image] = await db
    .select({ id: imageTable.id, storageKey: imageTable.storageKey })
    .from(imageTable)
    .where(eq(imageTable.id, imageId));

  if (!image) throw createError({ statusCode: 400, message: '圖片不存在' });

  const [usedInContent] = await db
    .select({ imageId: workToImageTable.imageId })
    .from(workToImageTable)
    .where(eq(workToImageTable.imageId, imageId))
    .limit(1);

  const [usedAsCover] = await db
    .select({ workId: workTable.id })
    .from(workTable)
    .where(eq(workTable.coverId, imageId))
    .limit(1);

  if (usedInContent || usedAsCover) {
    throw createError({ statusCode: 400, message: '圖片已被使用，無法刪除' });
  }

  // 刪資料列和實體檔
  await Promise.allSettled([
    db.delete(imageTable).where(eq(imageTable.id, imageId)),
    blob.del(image.storageKey),
  ]);

  return {};
});
