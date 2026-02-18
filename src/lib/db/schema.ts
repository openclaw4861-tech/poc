import { pgTable, serial, timestamp, integer } from 'drizzle-orm/pg-core';

export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
