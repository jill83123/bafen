import { PaginationShape } from '#server/schema';
import { categories } from '#shared/constants/work';
import { db } from '@nuxthub/db';
import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '@nuxthub/db/schema';
import { and, asc, countDistinct, desc, eq, exists, inArray, max } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
  category: z
    .enum(['all', ...categories, ''])
    .optional()
    .transform((value) => value || 'all'),
  tags: z
    .string()
    .regex(/^(\d+(,\d+)*)?$/) // 允許空字串或以逗號分隔的數字字串
    .optional()
    .transform((value) => (value ? value.split(',').map((tag) => Number(tag.trim())) : [])),
});

export default defineEventHandler(async (event) => {
  const {
    page: currentPage,
    page_size: pageSize,
    category: currentCategory,
    tags: currentTags,
  } = await validateQuery(event, QuerySchema);

  const offset = (currentPage - 1) * pageSize;

  // 固定條件：只顯示公開的作品
  const whereConditions = [eq(workTable.isPublic, true)];

  if (currentCategory !== 'all') whereConditions.push(eq(workTable.category, currentCategory));

  whereConditions.push(
    ...currentTags.map((tagId) =>
      exists(
        db
          .select()
          .from(workToTagTable)
          .where(and(eq(workToTagTable.workId, workTable.id), eq(workToTagTable.tagId, tagId))),
      ),
    ),
  );

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  // 取得原始資料和計算總數
  const [rawWorks, summary] = await Promise.all([
    db
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
      .leftJoin(workToTagTable, eq(workTable.id, workToTagTable.workId))
      .where(whereClause)
      .groupBy(workTable.id)
      .orderBy(desc(workTable.createdAt))
      .limit(pageSize)
      .offset(offset),

    db
      .select({
        total: countDistinct(workTable.id), // work、tag 為多對多，故使用 countDistinct
        latestUpdatedAt: max(workTable.updatedAt),
      })
      .from(workTable)
      .leftJoin(workToTagTable, eq(workTable.id, workToTagTable.workId))
      .where(whereClause)
      .get(),
  ]);

  const totalPages = Math.ceil(summary!.total / pageSize);

  // 取得該頁作品的標籤和圖片
  const workIds = rawWorks.map((work) => work.id);

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
  const works: WorkItem[] = rawWorks.map((work) => ({
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
    latestUpdatedAt: summary?.latestUpdatedAt ?? null,
  };
});
