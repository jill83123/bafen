import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '#server/db/schema';
import { UuidV4Schema } from '#server/schema';
import { WorkFormSchema } from '#shared/schema';
import { and, eq, inArray, ne, notExists } from 'drizzle-orm';

const BodySchema = WorkFormSchema.extend({
  id: UuidV4Schema,
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bodyParseResult = BodySchema.safeParse(body);
  if (!bodyParseResult.success) throw createError({ statusCode: 400 });

  const { id: workId, ...workData } = bodyParseResult.data;

  const imageIds = [...new Set(workData.imageIds)];
  const imageIdsToCheck = [...new Set([workData.coverId, ...imageIds])];
  const tagNames = [...new Set(workData.tags.map((tag) => tag.trim()).filter(Boolean))];

  // 確保作品存在
  const [existingWorkById] = await db
    .select({ id: workTable.id })
    .from(workTable)
    .where(eq(workTable.id, workId));

  if (!existingWorkById) throw createError({ statusCode: 400, message: '作品不存在' });

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
  if (missingImageIds.length) throw createError({ statusCode: 400, message: '圖片不存在' });

  await db.transaction(async (tx: typeof db) => {
    await tx
      .update(workTable)
      .set({
        title: workData.title,
        slug: workData.slug,
        category: workData.category,
        coverId: workData.coverId,
        isPublic: workData.isPublic,
      })
      .where(eq(workTable.id, workId));

    await tx.delete(workToImageTable).where(eq(workToImageTable.workId, workId));

    await tx.insert(workToImageTable).values(
      imageIds.map((imageId, index) => ({
        workId,
        imageId,
        sortOrder: index,
      })),
    );

    await tx.delete(workToTagTable).where(eq(workToTagTable.workId, workId));

    if (tagNames.length) {
      const existingTags = await tx
        .select({ id: tagTable.id, name: tagTable.name })
        .from(tagTable)
        .where(inArray(tagTable.name, tagNames));

      const existingTagNames = new Set(existingTags.map((tag: { name: string }) => tag.name));
      const missingTagNames = tagNames.filter((tagName) => !existingTagNames.has(tagName));

      // 標籤若不存在則新增
      if (missingTagNames.length) {
        await tx
          .insert(tagTable)
          .values(missingTagNames.map((name) => ({ name })))
          .onConflictDoNothing();
      }

      const tags = await tx
        .select({ id: tagTable.id })
        .from(tagTable)
        .where(inArray(tagTable.name, tagNames));

      await tx.insert(workToTagTable).values(
        tags.map((tag: { id: number }) => ({
          workId,
          tagId: tag.id,
        })),
      );
    }

    // 清理未使用的標籤
    await tx
      .delete(tagTable)
      .where(
        notExists(tx.select().from(workToTagTable).where(eq(workToTagTable.tagId, tagTable.id))),
      );
  });

  return {};
});
