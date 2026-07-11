import { db } from '@nuxthub/db';
import { contactTable } from '@nuxthub/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const ParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d*$/)
    .transform((value) => Number(value)),
});

export default defineEventHandler(async (event) => {
  const { id: contactId } = await validateParams(event, ParamSchema);

  const [contact] = await db
    .select({ id: contactTable.id })
    .from(contactTable)
    .where(eq(contactTable.id, contactId));

  if (!contact) throw createError({ statusCode: 404, message: '聯絡資料不存在' });

  await db.delete(contactTable).where(eq(contactTable.id, contactId));

  setResponseStatus(event, 204);
  return null;
});
