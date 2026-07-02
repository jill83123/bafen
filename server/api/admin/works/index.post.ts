import { WorkFormSchema } from '#shared/schema';
import { db } from '@nuxthub/db';
import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '@nuxthub/db/schema';
import { eq, inArray } from 'drizzle-orm';

const BodySchema = WorkFormSchema;

export default defineEventHandler(async (event) => {
  const workData = await validateBody(event, BodySchema);

  const imageIds = [...new Set(workData.imageIds)];
  const imageIdsToCheck = [...new Set([workData.coverId, ...imageIds])];
  const tagNames = [...new Set(workData.tags.map((tag) => tag.trim()).filter(Boolean))];

  // 確保 slug 是唯一的
  const [existingWork] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(eq(workTable.slug, workData.slug));

  if (existingWork) throw createError({ statusCode: 400, message: 'slug 已存在，請輸入其他名稱' });

  // 封面和圖片都必須已存在於 image 表
  const existingImages = await db
    .select({ id: imageTable.id })
    .from(imageTable)
    .where(inArray(imageTable.id, imageIdsToCheck));

  const existingImageIds = new Set(existingImages.map((image: { id: string }) => image.id));
  const missingImageIds = imageIdsToCheck.filter((imageId) => !existingImageIds.has(imageId));
  if (missingImageIds.length) throw createError({ statusCode: 404, message: '圖片不存在' });

  const createdWork = await db
    .insert(workTable)
    .values({
      title: workData.title,
      slug: workData.slug,
      category: workData.category,
      coverId: workData.coverId,
      isPublic: workData.isPublic,
    })
    .returning({ id: workTable.id })
    .get();

  await db.insert(workToImageTable).values(
    imageIds.map((imageId, index) => ({
      workId: createdWork.id,
      imageId,
      sortOrder: index,
    })),
  );

  if (tagNames.length) {
    const existingTags = await db
      .select({ id: tagTable.id, name: tagTable.name })
      .from(tagTable)
      .where(inArray(tagTable.name, tagNames));

    const existingTagNames = new Set(existingTags.map((tag: { name: string }) => tag.name));
    const missingTagNames = tagNames.filter((tagName) => !existingTagNames.has(tagName));

    // 標籤若不存在則新增
    if (missingTagNames.length) {
      await db
        .insert(tagTable)
        .values(missingTagNames.map((name) => ({ name })))
        .onConflictDoNothing();
    }

    const tags = await db
      .select({ id: tagTable.id })
      .from(tagTable)
      .where(inArray(tagTable.name, tagNames));

    if (tags.length) {
      await db.insert(workToTagTable).values(
        tags.map((tag: { id: number }) => ({
          workId: createdWork.id,
          tagId: tag.id,
        })),
      );
    }
  }

  return {};
});
