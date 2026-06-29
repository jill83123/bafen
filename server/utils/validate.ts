import type { H3Event } from 'h3';
import { z } from 'zod';

const isDev = process.env.NODE_ENV === 'development';

const formatError = (error: z.ZodError) => ({
  statusCode: 422,
  message: '欄位未填寫正確',
  data: isDev ? z.flattenError(error).fieldErrors : undefined,
});

export const validateParams = async <T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.output<T>> => {
  const result = await getValidatedRouterParams(event, schema.safeParse);
  if (!result.success) throw createError(formatError(result.error));
  return result.data;
};

export const validateQuery = async <T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.output<T>> => {
  const result = await getValidatedQuery(event, schema.safeParse);
  if (!result.success) throw createError(formatError(result.error));
  return result.data;
};

export const validateBody = async <T extends z.ZodTypeAny>(
  event: H3Event,
  schema: T,
): Promise<z.output<T>> => {
  const result = await readValidatedBody(event, schema.safeParse);
  if (!result.success) throw createError(formatError(result.error));
  return result.data;
};
