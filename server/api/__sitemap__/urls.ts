import { db } from '@nuxthub/db';
import { workTable } from '@nuxthub/db/schema';
import { desc, eq } from 'drizzle-orm';

export default defineSitemapEventHandler(async () => {
  const works = await db
    .select({
      slug: workTable.slug,
      updatedAt: workTable.updatedAt,
    })
    .from(workTable)
    .where(eq(workTable.isPublic, true))
    .orderBy(desc(workTable.updatedAt), desc(workTable.createdAt))
    .all();

  return works.map((work) => ({
    loc: `/works/${work.slug}`,
    lastmod: work.updatedAt?.toISOString(),
  }));
});
