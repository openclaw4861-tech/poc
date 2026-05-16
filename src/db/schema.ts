import { pgTable, serial, varchar, integer, decimal, boolean, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const measurements = pgTable('measurements', {
  id: serial('id').primaryKey(),
  jobName: varchar('job_name', { length: 255 }).notNull(),
  frameNumber: varchar('frame_number', { length: 50 }).notNull(),
  numberOfLites: integer('number_of_lites').notNull(),
  mullionWidth: decimal('mullion_width', { precision: 8, scale: 4 }),
  
  // Glass bite (per side)
  glassBiteTop: decimal('glass_bite_top', { precision: 8, scale: 4 }).notNull().default('0.375'),
  glassBiteBottom: decimal('glass_bite_bottom', { precision: 8, scale: 4 }).notNull().default('0.375'),
  glassBiteLeft: decimal('glass_bite_left', { precision: 8, scale: 4 }).notNull().default('0.375'),
  glassBiteRight: decimal('glass_bite_right', { precision: 8, scale: 4 }).notNull().default('0.375'),
  
  // Glass type (frame level - propagates to lites)
  glassType: varchar('glass_type', { length: 50 }).notNull().default('Annealed'),
  glassThickness: varchar('glass_thickness', { length: 20 }).notNull().default('1/4"'),
  
  // Frame notes (edge work, polish, etc.)
  frameNotes: text('frame_notes'),
  
  // Photo URL (stored in cloud storage, e.g., Vercel Blob, AWS S3)
  photoUrl: varchar('photo_url', { length: 500 }),
  photoCaption: text('photo_caption'),
  
  // Level line measurements
  levelToHeadLeft: decimal('level_to_head_left', { precision: 8, scale: 4 }).notNull(),
  levelToHeadRight: decimal('level_to_head_right', { precision: 8, scale: 4 }).notNull(),
  levelToSillLeft: decimal('level_to_sill_left', { precision: 8, scale: 4 }).notNull(),
  levelToSillRight: decimal('level_to_sill_right', { precision: 8, scale: 4 }).notNull(),
  
  // Plumb line measurements
  plumbToLeftHead: decimal('plumb_to_left_head', { precision: 8, scale: 4 }).notNull(),
  plumbToRightHead: decimal('plumb_to_right_head', { precision: 8, scale: 4 }).notNull(),
  plumbToLeftSill: decimal('plumb_to_left_sill', { precision: 8, scale: 4 }).notNull(),
  plumbToRightSill: decimal('plumb_to_right_sill', { precision: 8, scale: 4 }).notNull(),

  // Joint height measurements as JSON: { head: string[], sill: string[] }
  jointData: text('joint_data'),
  
  // Joint height measurements (when numberOfLites > 1)
  // Each joint: 2 measurements at that boundary (up to head, down to sill from level line)

  
  // Calculated dimensions
  totalFrameWidth: decimal('total_frame_width', { precision: 8, scale: 4 }).notNull(),
  totalFrameHeight: decimal('total_frame_height', { precision: 8, scale: 4 }).notNull(),
  isOutOfSquare: boolean('is_out_of_square').notNull().default(false),
  squarenessVariance: decimal('squareness_variance', { precision: 8, scale: 4 }),
  
  // Metadata
  measuredBy: varchar('measured_by', { length: 100 }).notNull(),
  measuredAt: timestamp('measured_at').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    idxJobName: index('idx_job_name').on(table.jobName),
    idxFrameNumber: index('idx_frame_number').on(table.frameNumber),
    idxMeasuredAt: index('idx_measured_at').on(table.measuredAt),
  };
});

export const glassLites = pgTable('glass_lites', {
  id: serial('id').primaryKey(),
  measurementId: integer('measurement_id').notNull().references(() => measurements.id, { onDelete: 'cascade' }),
  liteNumber: integer('lite_number').notNull(),
  width: varchar('width', { length: 20 }).notNull(),
  height: varchar('height', { length: 20 }).notNull(),
  widthDecimal: decimal('width_decimal', { precision: 14, scale: 10 }).notNull(),
  heightDecimal: decimal('height_decimal', { precision: 14, scale: 10 }).notNull(),
  
  // Per-boundary height measurements for this lite
  // Left boundary (head/sill = up/down from level line)
  // Right boundary (head/sill = up/down from level line)
  
  // Square status for this lite
  // Which corners are square (e.g. "Top corners square" or "Bottom corners square")
  
  // Lite shape
  
  // Glass properties (inherited from frame, but can override per lite)
  glassType: varchar('glass_type', { length: 50 }),
  glassThickness: varchar('glass_thickness', { length: 20 }),
  
  // Lite-specific notes (edge work, holes, cutouts)
  liteNotes: text('lite_notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    idxMeasurementId: index('idx_measurement_id').on(table.measurementId),
    idxLiteNumber: index('idx_lite_number').on(table.liteNumber),
  };
});

export const measurementsRelations = relations(measurements, ({ many }) => ({
  glassLites: many(glassLites),
}));

export const glassLitesRelations = relations(glassLites, ({ one }) => ({
  measurement: one(measurements, {
    fields: [glassLites.measurementId],
    references: [measurements.id],
  }),
}));

export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
export type GlassLite = typeof glassLites.$inferSelect;
export type NewGlassLite = typeof glassLites.$inferInsert;


// Tasks table for SVAR React Gantt
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  text: varchar('text', { length: 255 }).notNull().default(''),
  start: varchar('start', { length: 20 }).notNull(),
  end: varchar('end', { length: 20 }).notNull(),
  duration: integer('duration').notNull().default(0),
  progress: integer('progress').notNull().default(0),
  type: varchar('type', { length: 20 }),
  parent: integer('parent').notNull().default(0),
  order_id: integer('order_id').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  source: integer('source').notNull(),
  target: integer('target').notNull(),
  type: varchar('type', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const tasksRelations = relations(tasks, ({ many }) => ({
  children: many(tasks, { relationName: 'parent_task' }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  sourceTask: one(tasks, {
    fields: [links.source],
    references: [tasks.id],
  }),
  targetTask: one(tasks, {
    fields: [links.target],
    references: [tasks.id],
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;


// Visitors table
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Visitor = typeof visitors.$inferSelect;
export type NewVisitor = typeof visitors.$inferInsert;


// Submittal Tracker tables
export const submittalChecklists = pgTable('submittal_checklists', {
  id: serial('id').primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull(),
  pdfFilePath: varchar('pdf_file_path', { length: 500 }).notNull(),
  pdfUploadedAt: timestamp('pdf_uploaded_at').notNull(),
  extractedAt: timestamp('extracted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    idxProjectId: index('idx_submittal_project_id').on(table.projectId),
  };
});

export const submittalItems = pgTable('submittal_items', {
  id: serial('id').primaryKey(),
  checklistId: integer('checklist_id').notNull().references(() => submittalChecklists.id, { onDelete: 'cascade' }),
  specSection: varchar('spec_section', { length: 50 }).notNull(),
  specSubsection: varchar('spec_subsection', { length: 50 }),
  requirementType: varchar('requirement_type', { length: 100 }),
  description: text('description').notNull(),
  details: text('details'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  userNotes: text('user_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    idxChecklistId: index('idx_submittal_checklist_id').on(table.checklistId),
    idxSpecSection: index('idx_submittal_spec_section').on(table.specSection),
  };
});

export const submittalChecklistsRelations = relations(submittalChecklists, ({ many }) => ({
  items: many(submittalItems),
}));

export const submittalItemsRelations = relations(submittalItems, ({ one }) => ({
  checklist: one(submittalChecklists, {
    fields: [submittalItems.checklistId],
    references: [submittalChecklists.id],
  }),
}));

export type SubmittalChecklist = typeof submittalChecklists.$inferSelect;
export type NewSubmittalChecklist = typeof submittalChecklists.$inferInsert;
export type SubmittalItem = typeof submittalItems.$inferSelect;
export type NewSubmittalItem = typeof submittalItems.$inferInsert;
