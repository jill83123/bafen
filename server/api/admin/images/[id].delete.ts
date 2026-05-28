import { imageTable } from '#server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const { id: imageId } = getRouterParams(event);
  if (!imageId) throw createError({ statusCode: 400, message: '圖片刪除失敗' });

  const [image] = await db
    .select({ id: imageTable.id, storageKey: imageTable.storageKey })
    .from(imageTable)
    .where(eq(imageTable.id, imageId));

  if (!image) throw createError({ statusCode: 400, message: '圖片不存在' });

  // 刪資料列和實體檔
  await Promise.allSettled([
    db.delete(imageTable).where(eq(imageTable.id, imageId)),
    blob.del(image.storageKey),
  ]);

  return { message: '圖片刪除成功' };
});
