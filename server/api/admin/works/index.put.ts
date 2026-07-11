import { UuidV4Schema } from '#server/schema';
import { WorkFormSchema } from '#shared/schema';
import { db } from '@nuxthub/db';
import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '@nuxthub/db/schema';
import { and, eq, inArray, ne, notExists } from 'drizzle-orm';

const BodySchema = WorkFormSchema.extend({
  id: UuidV4Schema,
});

export default defineEventHandler(async (event) => {
  const { id: workId, ...workData } = await validateBody(event, BodySchema);

  const imageIds = [...new Set(workData.imageIds)];
  const imageIdsToCheck = [...new Set([workData.coverId, ...imageIds])];
  const tagNames = [...new Set(workData.tags.map((tag) => tag.trim()).filter(Boolean))];

  // 確保作品存在
  const [existingWorkById] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(eq(workTable.id, workId));

  if (!existingWorkById) throw createError({ statusCode: 404, message: '作品不存在' });

  // 確保 slug 唯一（可沿用原本的 slug）
  const [existingWorkBySlug] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(and(eq(workTable.slug, workData.slug), ne(workTable.id, workId)));

  if (existingWorkBySlug) {
    throw createError({ statusCode: 400, message: 'slug 已存在，請輸入其他名稱' });
  }

  // 封面和圖片都必須已存在於 image 表
  const existingImages = await db
    .select({ id: imageTable.id })
    .from(imageTable)
    .where(inArray(imageTable.id, imageIdsToCheck));

  const existingImageIds = new Set(existingImages.map((image: { id: string }) => image.id));
  const missingImageIds = imageIdsToCheck.filter((imageId) => !existingImageIds.has(imageId));
  if (missingImageIds.length) throw createError({ statusCode: 404, message: '圖片不存在' });

  await db.batch([
    db
      .update(workTable)
      .set({
        title: workData.title,
        slug: workData.slug,
        category: workData.category,
        coverId: workData.coverId,
        isPublic: workData.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(workTable.id, workId)),

    db.delete(workToImageTable).where(eq(workToImageTable.workId, workId)),

    db.insert(workToImageTable).values(
      imageIds.map((imageId, index) => ({
        workId,
        imageId,
        sortOrder: index,
      })),
    ),

    db.delete(workToTagTable).where(eq(workToTagTable.workId, workId)),
  ]);

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
          workId,
          tagId: tag.id,
        })),
      );
    }
  }

  // 清理未使用的標籤
  await db
    .delete(tagTable)
    .where(
      notExists(db.select().from(workToTagTable).where(eq(workToTagTable.tagId, tagTable.id))),
    );

  setResponseStatus(event, 204);
  return null;
});
