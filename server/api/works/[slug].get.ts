import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '#server/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export default defineEventHandler(async (event) => {
  const param = getRouterParams(event);
  const paramParseResult = ParamSchema.safeParse(param);
  if (!paramParseResult.success) throw createError({ statusCode: 400 });

  const { slug: currentSlug } = paramParseResult.data;

  const [workData] = await db
    .select({
      id: workTable.id,
      title: workTable.title,
      slug: workTable.slug,
      category: workTable.category,
      coverId: workTable.coverId,
      coverPath: imageTable.storageKey,
      createdAt: workTable.createdAt,
      updatedAt: workTable.updatedAt,
    })
    .from(workTable)
    .innerJoin(imageTable, eq(workTable.coverId, imageTable.id))
    .where(and(eq(workTable.isPublic, true), eq(workTable.slug, currentSlug)))
    .limit(1);

  if (!workData) throw createError({ statusCode: 404, message: '作品不存在' });

  const [workTags, workImages] = await Promise.all([
    db
      .select({
        id: workToTagTable.tagId,
        name: tagTable.name,
      })
      .from(workToTagTable)
      .innerJoin(tagTable, eq(workToTagTable.tagId, tagTable.id))
      .where(eq(workToTagTable.workId, workData.id)),

    db
      .select({
        id: workToImageTable.imageId,
        path: imageTable.storageKey,
      })
      .from(workToImageTable)
      .innerJoin(imageTable, eq(workToImageTable.imageId, imageTable.id))
      .where(eq(workToImageTable.workId, workData.id))
      .orderBy(asc(workToImageTable.sortOrder)),
  ]);

  return {
    data: {
      id: workData.id,
      title: workData.title,
      slug: workData.slug,
      category: workData.category,
      tags: workTags,
      cover: {
        id: workData.coverId,
        path: workData.coverPath,
      },
      images: workImages,
      createdAt: workData.createdAt,
      updatedAt: workData.updatedAt,
    },
  };
});
