import { blob, ensureBlob } from '@nuxthub/blob';
import { db } from '@nuxthub/db';
import { imageTable } from '@nuxthub/db/schema';

export default defineEventHandler(async (event) => {
  const contentType = event.node.req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    throw createError({ statusCode: 400, message: '請使用 multipart/form-data 上傳檔案' });
  }

  const formData = await readFormData(event);
  const images = formData.getAll('images') as File[];

  if (!images.length) throw createError({ statusCode: 400, message: '未上傳任何檔案' });

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
    storageKey: `/${file.pathname}`,
    size: file.size as number,
  }));

  try {
    await db.insert(imageTable).values(recordsToInsert);
  } catch {
    // DB 寫入失敗時，清掉已上傳檔案以避免殘留 orphan files
    await Promise.allSettled(uploadResults.map((file) => blob.del(file.pathname)));
    throw createError({ statusCode: 500, message: '伺服器錯誤，請稍後再試' });
  }

  setResponseStatus(event, 201);
  return {
    count: uploadResults.length,
  };
});
