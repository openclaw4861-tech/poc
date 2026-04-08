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
  
  // Joint height measurements (when numberOfLites > 1)
  // Each joint: 2 measurements at that boundary (up to head, down to sill from level line)
  levelToHeadJoint1: decimal('level_to_head_joint_1', { precision: 8, scale: 4 }),
  levelToSillJoint1: decimal('level_to_sill_joint_1', { precision: 8, scale: 4 }),
  levelToHeadJoint2: decimal('level_to_head_joint_2', { precision: 8, scale: 4 }),
  levelToSillJoint2: decimal('level_to_sill_joint_2', { precision: 8, scale: 4 }),
  levelToHeadJoint3: decimal('level_to_head_joint_3', { precision: 8, scale: 4 }),
  levelToSillJoint3: decimal('level_to_sill_joint_3', { precision: 8, scale: 4 }),
  levelToHeadJoint4: decimal('level_to_head_joint_4', { precision: 8, scale: 4 }),
  levelToSillJoint4: decimal('level_to_sill_joint_4', { precision: 8, scale: 4 }),
  levelToHeadJoint5: decimal('level_to_head_joint_5', { precision: 8, scale: 4 }),
  levelToSillJoint5: decimal('level_to_sill_joint_5', { precision: 8, scale: 4 }),
  levelToHeadJoint6: decimal('level_to_head_joint_6', { precision: 8, scale: 4 }),
  levelToSillJoint6: decimal('level_to_sill_joint_6', { precision: 8, scale: 4 }),
  levelToHeadJoint7: decimal('level_to_head_joint_7', { precision: 8, scale: 4 }),
  levelToSillJoint7: decimal('level_to_sill_joint_7', { precision: 8, scale: 4 }),
  levelToHeadJoint8: decimal('level_to_head_joint_8', { precision: 8, scale: 4 }),
  levelToSillJoint8: decimal('level_to_sill_joint_8', { precision: 8, scale: 4 }),
  levelToHeadJoint9: decimal('level_to_head_joint_9', { precision: 8, scale: 4 }),
  levelToSillJoint9: decimal('level_to_sill_joint_9', { precision: 8, scale: 4 }),
  levelToHeadJoint10: decimal('level_to_head_joint_10', { precision: 8, scale: 4 }),
  levelToSillJoint10: decimal('level_to_sill_joint_10', { precision: 8, scale: 4 }),
  levelToHeadJoint11: decimal('level_to_head_joint_11', { precision: 8, scale: 4 }),
  levelToSillJoint11: decimal('level_to_sill_joint_11', { precision: 8, scale: 4 }),
  levelToHeadJoint12: decimal('level_to_head_joint_12', { precision: 8, scale: 4 }),
  levelToSillJoint12: decimal('level_to_sill_joint_12', { precision: 8, scale: 4 }),
  levelToHeadJoint13: decimal('level_to_head_joint_13', { precision: 8, scale: 4 }),
  levelToSillJoint13: decimal('level_to_sill_joint_13', { precision: 8, scale: 4 }),
  levelToHeadJoint14: decimal('level_to_head_joint_14', { precision: 8, scale: 4 }),
  levelToSillJoint14: decimal('level_to_sill_joint_14', { precision: 8, scale: 4 }),
  levelToHeadJoint15: decimal('level_to_head_joint_15', { precision: 8, scale: 4 }),
  levelToSillJoint15: decimal('level_to_sill_joint_15', { precision: 8, scale: 4 }),

  
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
  width: decimal('width', { precision: 8, scale: 4 }).notNull(),
  height: decimal('height', { precision: 8, scale: 4 }).notNull(),
  widthDecimal: decimal('width_decimal', { precision: 10, scale: 6 }).notNull(),
  heightDecimal: decimal('height_decimal', { precision: 10, scale: 6 }).notNull(),
  
  // Per-boundary height measurements for this lite
  // Left boundary (head/sill = up/down from level line)
  leftHead: decimal('left_head', { precision: 8, scale: 4 }),
  leftSill: decimal('left_sill', { precision: 8, scale: 4 }),
  // Right boundary (head/sill = up/down from level line)
  rightHead: decimal('right_head', { precision: 8, scale: 4 }),
  rightSill: decimal('right_sill', { precision: 8, scale: 4 }),
  
  // Square status for this lite
  topSquare: boolean('top_square').notNull().default(true),
  bottomSquare: boolean('bottom_square').notNull().default(true),
  // Which corners are square (e.g. "Top corners square" or "Bottom corners square")
  squareCornersNote: varchar('square_corners_note', { length: 100 }),
  
  // Lite shape
  liteShape: varchar('lite_shape', { length: 30 }).notNull().default('rectangular'),
  
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

// Relations
export const measurementsRelations = relations(measurements, ({ many }) => ({
  glassLites: many(glassLites),
}));

export const glassLitesRelations = relations(glassLites, ({ one }) => ({
  measurement: one(measurements, {
    fields: [glassLites.measurementId],
    references: [measurements.id],
  }),
}));

// Type exports
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
export type GlassLite = typeof glassLites.$inferSelect;
export type NewGlassLite = typeof glassLites.$inferInsert;


// Visitors table (used by the /api/visitors route)
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
