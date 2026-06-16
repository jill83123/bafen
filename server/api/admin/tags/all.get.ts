import { db } from '@nuxthub/db';
import { tagTable, workToTagTable } from '@nuxthub/db/schema';
import { count, desc, eq } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const tags = await db
    .select({
      id: tagTable.id,
      name: tagTable.name,
    })
    .from(tagTable)
    .leftJoin(workToTagTable, eq(workToTagTable.tagId, tagTable.id))
    .groupBy(tagTable.id, tagTable.name)
    .orderBy(desc(count(workToTagTable.workId)));

  return [...tags];
});
