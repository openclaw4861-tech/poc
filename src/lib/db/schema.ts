import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Tasks table for SVAR React Gantt
 * 
 * Fields required by Svar Gantt:
 * - id: unique identifier
 * - text: task name
 * - start: ISO date string for task start
 * - end: ISO date string for task end
 * - duration: duration in days
 * - progress: completion percentage (0-100)
 * - type: task type ("summary", "milestone", or null)
 * - parent: parent task id (0 for top-level)
 * - orderId: display order within parent
 */
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  text: varchar('text', { length: 255 }).notNull().default(''),
  start: varchar('start', { length: 20 }).notNull(),
  end: varchar('end', { length: 20 }).notNull(),
  duration: integer('duration').notNull().default(0),
  progress: integer('progress').notNull().default(0),
  type: varchar('type', { length: 20 }),
  parent: integer('parent').notNull().default(0),
  orderId: integer('order_id').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Links table for task dependencies in SVAR React Gantt
 * 
 * Link types:
 * - "e2s": End-to-Start (most common)
 * - "s2s": Start-to-Start
 * - "e2e": End-to-End
 * - "s2e": Start-to-End
 */
export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  source: integer('source').notNull(),
  target: integer('target').notNull(),
  type: varchar('type', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Visitors table (used by the /api/visitors route)
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type Visitor = typeof visitors.$inferSelect;
export type NewVisitor = typeof visitors.$inferInsert;
