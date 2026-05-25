import { integer, text } from 'drizzle-orm/sqlite-core';

export const uuid = (name: string) => {
  return text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
};

export const timestamp = (name: string) => {
  return integer(name, { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date());
};
