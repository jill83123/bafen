import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '#server/db/schema';
import { WorkFormSchema } from '#shared/schema';
import { eq, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const bodyParseResult = WorkFormSchema.safeParse(body);
  if (!bodyParseResult.success) throw createError({ statusCode: 400 });

  const workData = bodyParseResult.data;

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
  if (missingImageIds.length) throw createError({ statusCode: 400, message: '圖片不存在' });

  await db.transaction(async (tx: typeof db) => {
    const [createdWork] = await tx
      .insert(workTable)
      .values({
        title: workData.title,
        slug: workData.slug,
        category: workData.category,
        coverId: workData.coverId,
        isPublic: workData.isPublic,
      })
      .returning({ id: workTable.id });

    await tx.insert(workToImageTable).values(
      imageIds.map((imageId, index) => ({
        workId: createdWork.id,
        imageId,
        sortOrder: index,
      })),
    );

    if (!tagNames.length) return;

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

    if (tags.length) {
      await tx.insert(workToTagTable).values(
        tags.map((tag: { id: number }) => ({
          workId: createdWork.id,
          tagId: tag.id,
        })),
      );
    }
  });

  return {};
});
