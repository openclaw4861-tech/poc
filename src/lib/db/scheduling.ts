import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import {
  projects,
  tasks,
  taskDependencies,
  resources,
  taskAssignments,
  type Project,
  type NewProject,
  type Task,
  type NewTask,
  type TaskDependency,
  type NewTaskDependency,
  type Resource,
  type NewResource,
  type TaskAssignment,
  type NewTaskAssignment,
} from './scheduling-schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const schedulingDb = drizzle(pool, {
  schema: { projects, tasks, taskDependencies, resources, taskAssignments },
});

export {
  projects,
  tasks,
  taskDependencies,
  resources,
  taskAssignments,
};
export type {
  Project,
  NewProject,
  Task,
  NewTask,
  TaskDependency,
  NewTaskDependency,
  Resource,
  NewResource,
  TaskAssignment,
  NewTaskAssignment,
};