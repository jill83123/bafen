import { imageTable } from '#server/db/schema';
import { blob, ensureBlob } from '@nuxthub/blob';

export default defineEventHandler(async (event) => {
  const contentType = event.node.req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    throw createError({ statusCode: 400, message: '圖片上傳失敗' });
  }

  const formData = await readFormData(event);
  const images = formData.getAll('images') as File[];

  if (!images.length) throw createError({ statusCode: 400, message: '圖片上傳失敗' });

  // 上傳到檔案儲存服務
  const uploadResults = await Promise.all(
    images.map(async (file) => {
      ensureBlob(file, { maxSize: '1MB', types: ['image/webp'] });
      const ext = file.name.split('.').pop();
      const randomName = crypto.randomUUID();
      const pathname = `images/${randomName}.${ext}`;
      return await blob.put(pathname, file);
    }),
  );

  // 將資訊存入資料表
  const recordsToInsert = uploadResults.map((file) => ({
    storageKey: file.pathname,
    size: file.size,
  }));

  await db.insert(imageTable).values(recordsToInsert);

  return {
    message: '圖片上傳成功',
    data: {
      count: uploadResults.length,
    },
  };
});
