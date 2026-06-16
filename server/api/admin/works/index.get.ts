import { PaginationShape } from '#server/schema';
import { categories } from '#shared/constants/work';
import type { AdminWorkItem, ImageItem, TagItem } from '#shared/types/work';
import { db } from '@nuxthub/db';
import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '@nuxthub/db/schema';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
  category: z
    .enum(['all', ...categories, ''])
    .optional()
    .transform((value) => value || 'all'),
  is_public: z.enum(['true', 'false', '']).optional().default(''),
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queryParseResult = QuerySchema.safeParse(query);
  if (!queryParseResult.success) throw createError({ statusCode: 400 });

  const currentPage = queryParseResult.data.page;
  const pageSize = queryParseResult.data.page_size;
  const offset = (currentPage - 1) * pageSize;

  const currentCategory = queryParseResult.data.category;
  const isPublic = queryParseResult.data.is_public;

  const whereConditions = [];

  if (isPublic === 'true') whereConditions.push(eq(workTable.isPublic, true));
  else if (isPublic === 'false') whereConditions.push(eq(workTable.isPublic, false));

  if (currentCategory !== 'all') whereConditions.push(eq(workTable.category, currentCategory));

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  // 取得原始資料和計算總數
  const [rawWorks, countSummary] = await Promise.all([
    db
      .select({
        id: workTable.id,
        title: workTable.title,
        slug: workTable.slug,
        category: workTable.category,
        coverId: workTable.coverId,
        coverPath: imageTable.storageKey,
        isPublic: workTable.isPublic,
        createdAt: workTable.createdAt,
        updatedAt: workTable.updatedAt,
      })
      .from(workTable)
      .innerJoin(imageTable, eq(workTable.coverId, imageTable.id))
      .where(whereClause)
      .orderBy(desc(workTable.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({ total: count(workTable.id) })
      .from(workTable)
      .where(whereClause)
      .get(),
  ]);

  const totalPages = Math.ceil(countSummary!.total / pageSize);

  // 取得該頁作品的標籤和圖片
  type RawWork = (typeof rawWorks)[number];

  const workIds = rawWorks.map((work: RawWork) => work.id);

  const [workTags, workImages] = workIds.length
    ? await Promise.all([
        db
          .select({
            workId: workToTagTable.workId,
            id: workToTagTable.tagId,
            name: tagTable.name,
          })
          .from(workToTagTable)
          .innerJoin(tagTable, eq(workToTagTable.tagId, tagTable.id))
          .where(inArray(workToTagTable.workId, workIds)),

        db
          .select({
            workId: workToImageTable.workId,
            id: workToImageTable.imageId,
            path: imageTable.storageKey,
            sortOrder: workToImageTable.sortOrder,
          })
          .from(workToImageTable)
          .innerJoin(imageTable, eq(workToImageTable.imageId, imageTable.id))
          .where(inArray(workToImageTable.workId, workIds))
          .orderBy(asc(workToImageTable.sortOrder)),
      ])
    : [[], []];

  const tagsByWorkId: Record<string, TagItem[]> = {};
  const imagesByWorkId: Record<string, ImageItem[]> = {};

  for (const tag of workTags) {
    const workId = tag.workId;
    (tagsByWorkId[workId] ??= []).push({ id: tag.id, name: tag.name });
  }

  for (const image of workImages) {
    const workId = image.workId;
    (imagesByWorkId[workId] ??= []).push({ id: image.id, path: image.path });
  }

  // 最終資料結構
  const works: AdminWorkItem[] = rawWorks.map((work: RawWork) => ({
    id: work.id,
    title: work.title,
    slug: work.slug,
    category: work.category,
    tags: tagsByWorkId[work.id] || [],
    cover: {
      id: work.coverId,
      path: work.coverPath,
    },
    images: imagesByWorkId[work.id] || [],
    isPublic: work.isPublic,
    createdAt: work.createdAt.toISOString(),
    updatedAt: work.updatedAt.toISOString(),
  }));

  return {
    works,
    pagination: {
      currentPage,
      totalPages,
      hasPrePage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    },
  };
});
