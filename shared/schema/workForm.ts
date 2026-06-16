import { categories } from '#shared/constants/work';
import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const WorkFormSchema = z.object({
  title: z.string().trim().min(1, '標題為必填欄位'),
  slug: z.string().regex(slugRegex, 'slug 僅能使用英文小寫與數字，請使用 - 連接且不能包含空白'),
  category: z.enum(categories, '請選擇一個類別'),
  tags: z.array(z.string().trim().min(1, '標籤名不能為空')),
  coverId: z.string().trim().min(1, '請選擇一張封面圖片'),
  imageIds: z.array(z.string().trim().min(1)).min(1, '至少需要一張圖片'),
  isPublic: z.boolean().default(false),
});

export type WorkForm = z.infer<typeof WorkFormSchema>;
