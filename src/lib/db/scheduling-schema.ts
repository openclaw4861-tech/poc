import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  timestamp,
  index,
  foreignKey,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const constraintTypeEnum = pgEnum('constraint_type', ['FS', 'SS', 'FF', 'SF']);
export const resourceTypeEnum = pgEnum('resource_type', ['CREW', 'EQUIPMENT', 'MATERIAL']);
export const dependencyTypeEnum = pgEnum('dependency_type', ['FS', 'SS', 'FF', 'SF']);

export const projects = pgTable(
  'scheduling_projects',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 1000 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    idxName: index('sched_proj_name_idx').on(table.name),
  })
);

export const tasks = pgTable(
  'scheduling_tasks',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    parentTaskId: integer('parent_task_id').references((): ReturnType<typeof pgTable> => tasks.id, {
      onDelete: 'cascade',
    }),
    name: varchar('name', { length: 255 }).notNull(),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    durationDays: integer('duration_days').notNull(),
    percentComplete: integer('percent_complete').notNull().default(0),
    constraintType: constraintTypeEnum('constraint_type').default('FS'),
    constraintOffsetDays: integer('constraint_offset_days').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    idxProjectId: index('sched_task_project_idx').on(table.projectId),
    idxParentTaskId: index('sched_task_parent_idx').on(table.parentTaskId),
    idxStartDate: index('sched_task_start_idx').on(table.startDate),
  })
);

export const taskDependencies = pgTable(
  'scheduling_task_dependencies',
  {
    id: serial('id').primaryKey(),
    taskId: integer('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    dependsOnTaskId: integer('depends_on_task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    type: dependencyTypeEnum('type').default('FS'),
    lagDays: integer('lag_days').notNull().default(0),
  },
  (table) => ({
    idxTaskId: index('sched_dep_task_idx').on(table.taskId),
    idxDependsOn: index('sched_dep_depends_idx').on(table.dependsOnTaskId),
  })
);

export const resources = pgTable(
  'scheduling_resources',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: resourceTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    idxProjectId: index('sched_res_project_idx').on(table.projectId),
    idxType: index('sched_res_type_idx').on(table.type),
  })
);

export const taskAssignments = pgTable(
  'scheduling_task_assignments',
  {
    id: serial('id').primaryKey(),
    taskId: integer('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    resourceId: integer('resource_id')
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    idxTaskId: index('sched_assign_task_idx').on(table.taskId),
    idxResourceId: index('sched_assign_res_idx').on(table.resourceId),
  })
);

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
  resources: many(resources),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'TaskHierarchy',
  }),
  childTasks: many(tasks, { relationName: 'TaskHierarchy' }),
  dependencies: many(taskDependencies, { relationName: 'TaskDependencies' }),
  dependentTasks: many(taskDependencies, { relationName: 'DependentTasks' }),
  assignments: many(taskAssignments),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: 'TaskDependencies',
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: 'DependentTasks',
  }),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  project: one(projects, {
    fields: [resources.projectId],
    references: [projects.id],
  }),
  assignments: many(taskAssignments),
}));

export const taskAssignmentsRelations = relations(taskAssignments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignments.taskId],
    references: [tasks.id],
  }),
  resource: one(resources, {
    fields: [taskAssignments.resourceId],
    references: [resources.id],
  }),
}));

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type NewTaskDependency = typeof taskDependencies.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type TaskAssignment = typeof taskAssignments.$inferSelect;
export type NewTaskAssignment = typeof taskAssignments.$inferInsert;