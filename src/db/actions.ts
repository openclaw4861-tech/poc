import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './index';
import { tasks, links } from './schema';

// ============== TASKS ==============

/**
 * Get all tasks
 */
export async function getAllTasks() {
  return await db.select().from(tasks).orderBy(tasks.orderId);
}

/**
 * Get a single task by ID
 */
export async function getTaskById(id: number) {
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

/**
 * Create a new task
 */
export async function createTask(data: any) {
  const [newTask] = await db.insert(tasks).values(data).returning();
  return newTask;
}

/**
 * Update an existing task
 */
export async function updateTask(id: number, data: any) {
  const [updatedTask] = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tasks.id, id))
    .returning();
  return updatedTask;
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
}

/**
 * Handle task reordering/move operation
 * This handles the special "move" operation from SVAR Gantt
 */
export async function moveTask(id: number, operation: 'move', mode: 'after' | 'before' | 'child', target: number) {
  // First, get the task being moved
  const movingTask = await getTaskById(id);
  if (!movingTask) return undefined;

  // Get the target task
  const targetTask = await getTaskById(target);
  if (!targetTask) return undefined;

  if (mode === 'child') {
    // Make this task a child of target
    await updateTask(id, { parent: target, orderId: 0 });
    // Update order IDs for siblings
    await db.execute(sql`
      UPDATE tasks 
      SET order_id = order_id + 1 
      WHERE parent = ${target} AND order_id >= 0
    `);
    return await getTaskById(id);
  }

  // Handle 'after' or 'before' placement
  const currentOrderId = movingTask.orderId;
  const targetOrderId = targetTask.orderId;

  if (mode === 'after') {
    // Shift all tasks between current and target positions
    if (currentOrderId < targetOrderId) {
      // Moving down
      await db.execute(sql`
        UPDATE tasks 
        SET order_id = order_id - 1 
        WHERE parent = ${targetTask.parent} 
        AND order_id > ${currentOrderId} 
        AND order_id <= ${targetOrderId}
      `);
    } else {
      // Moving up
      await db.execute(sql`
        UPDATE tasks 
        SET order_id = order_id + 1 
        WHERE parent = ${targetTask.parent} 
        AND order_id >= ${targetOrderId} 
        AND order_id < ${currentOrderId}
      `);
    }
  } else {
    // Before - similar logic but reversed
    if (currentOrderId < targetOrderId) {
      await db.execute(sql`
        UPDATE tasks 
        SET order_id = order_id + 1 
        WHERE parent = ${targetTask.parent} 
        AND order_id > ${currentOrderId} 
        AND order_id <= ${targetOrderId}
      `);
    } else {
      await db.execute(sql`
        UPDATE tasks 
        SET order_id = order_id - 1 
        WHERE parent = ${targetTask.parent} 
        AND order_id >= ${targetOrderId} 
        AND order_id < ${currentOrderId}
      `);
    }
  }

  // Finally, update the moved task's order ID
  await db.execute(sql`
    UPDATE tasks 
    SET order_id = ${mode === 'after' ? targetOrderId + 1 : targetOrderId},
        parent = ${targetTask.parent}
    WHERE id = ${id}
  `);

  return await getTaskById(id);
}

// ============== LINKS ==============

/**
 * Get all links
 */
export async function getAllLinks() {
  return await db.select().from(links).orderBy(links.id);
}

/**
 * Get a single link by ID
 */
export async function getLinkById(id: number) {
  const result = await db.select().from(links).where(eq(links.id, id)).limit(1);
  return result[0];
}

/**
 * Create a new link
 */
export async function createLink(data: any) {
  const [newLink] = await db.insert(links).values(data).returning();
  return newLink;
}

/**
 * Update an existing link
 */
export async function updateLink(id: number, data: any) {
  const [updatedLink] = await db
    .update(links)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(links.id, id))
    .returning();
  return updatedLink;
}

/**
 * Delete a link by ID
 */
export async function deleteLink(id: number) {
  await db.delete(links).where(eq(links.id, id));
}

// ============== DATABASE SEEDING ==============

/**
 * Initialize database with sample data if tables are empty
 */
export async function initializeDatabase() {
  // Check if we have any tasks
  const tasksCount = await db.select({ count: sql<number>`count(*)` }).from(tasks);
  const count = Number(tasksCount[0]?.count) || 0;

  if (count === 0) {
    // Seed with sample data
    await db.insert(tasks).values([
      { text: 'Project Kickoff', start: '2024-01-01', end: '2024-01-03', duration: 3, progress: 100, type: 'milestone', parent: 0, orderId: 0 },
      { text: 'Requirements Gathering', start: '2024-01-04', end: '2024-01-10', duration: 7, progress: 100, parent: 0, orderId: 1 },
      { text: 'Design Phase', start: '2024-01-11', end: '2024-01-25', duration: 15, progress: 80, parent: 0, orderId: 2 },
      { text: 'Development', start: '2024-01-26', end: '2024-02-15', duration: 21, progress: 45, parent: 0, orderId: 3 },
      { text: 'Testing', start: '2024-02-16', end: '2024-02-28', duration: 12, progress: 0, parent: 0, orderId: 4 },
      { text: 'Deployment', start: '2024-03-01', end: '2024-03-03', duration: 3, progress: 0, type: 'milestone', parent: 0, orderId: 5 },
    ]);

    await db.insert(links).values([
      { source: 1, target: 2, type: 'e2s' },
      { source: 2, target: 3, type: 'e2s' },
      { source: 3, target: 4, type: 'e2s' },
      { source: 4, target: 5, type: 'e2s' },
      { source: 5, target: 6, type: 'e2s' },
    ]);
  }
}
