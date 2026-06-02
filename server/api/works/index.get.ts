import {
  imageTable,
  tagTable,
  workTable,
  workToImageTable,
  workToTagTable,
} from '#server/db/schema';
import { PaginationShape } from '#server/schema';
import { workCategories } from '#shared/constants/workCategory';
import { and, asc, count, desc, eq, inArray, max } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  ...PaginationShape,
  category: z
    .enum(['all', ...workCategories, ''])
    .optional()
    .transform((value) => value || 'all'),
  tags: z
    .string()
    .regex(/^(\d+(,\d+)*)?$/) // 允許空字串或以逗號分隔的數字字串
    .optional()
    .transform((value) => (value ? value.split(',').map((tag) => Number(tag.trim())) : [])),
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const queryParseResult = QuerySchema.safeParse(query);
  if (!queryParseResult.success) throw createError({ statusCode: 400 });

  const {
    page: currentPage,
    page_size: pageSize,
    category: currentCategory,
    tags: currentTags,
  } = queryParseResult.data;

  const offset = (currentPage - 1) * pageSize;

  // 固定條件：只顯示公開的作品
  const whereConditions = [eq(workTable.isPublic, true)];

  if (currentCategory !== 'all') whereConditions.push(eq(workTable.category, currentCategory));
  if (currentTags.length) whereConditions.push(inArray(workToTagTable.tagId, currentTags));

  const whereClause = whereConditions.length ? and(...whereConditions) : undefined;

  // 取得原始資料和計算總數
  const [rawWorks, [summary]] = await Promise.all([
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
        total: count(workTable.id),
        latestUpdatedAt: max(workTable.updatedAt),
      })
      .from(workTable)
      .leftJoin(workToTagTable, eq(workTable.id, workToTagTable.workId))
      .where(whereClause),
  ]);

  const totalPages = Math.ceil(summary.total / pageSize);

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

  type TagInfo = { id: number; name: string };
  type ImageInfo = { id: string; path: string };

  const tagsByWorkId: Record<string, TagInfo[]> = {};
  const imagesByWorkId: Record<string, ImageInfo[]> = {};

  for (const tag of workTags) {
    const workId = tag.workId;
    if (!tagsByWorkId[workId]) tagsByWorkId[workId] = [];
    tagsByWorkId[workId].push({ id: tag.id, name: tag.name });
  }

  for (const image of workImages) {
    const workId = image.workId;
    if (!imagesByWorkId[workId]) imagesByWorkId[workId] = [];
    imagesByWorkId[workId].push({ id: image.id, path: image.path });
  }

  // 最終資料結構
  const works = rawWorks.map((work: RawWork) => ({
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
    createdAt: work.createdAt,
    updatedAt: work.updatedAt,
  }));

  return {
    data: {
      works,
      pagination: {
        currentPage,
        totalPages,
        hasPrePage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
      latestUpdatedAt: summary.latestUpdatedAt,
    },
  };
});
