import { z } from 'zod';

export const PaginationShape = {
  page: z
    .string()
    .regex(/^\d*$/) // 確保是數字字串
    .optional()
    .transform((value) => (value ? Number(value) : 1))
    .refine((value) => value >= 1),
  page_size: z
    .string()
    .regex(/^\d*$/)
    .optional()
    .transform((value) => (value ? Number(value) : 10))
    .refine((value) => value >= 1),
};
