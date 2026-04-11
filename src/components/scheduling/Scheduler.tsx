'use client';

import { useEffect, useState } from 'react';
import { Gantt } from '@svar-ui/react-gantt';

interface TaskData {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  data?: TaskData[];
}

interface GanttTask {
  id: string;
  text: string;
  start: Date;
  end: Date;
  progress: number;
  data?: GanttTask[];
}

interface TaskResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  parentTaskId: number | null;
}

export default function ProjectScheduler({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/scheduling/tasks?projectId=${projectId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }
        const data: TaskResponse[] = await response.json();
        if (cancelled) return;

        const taskMap = new Map<string, GanttTask>();
        const rootTasks: GanttTask[] = [];

        // First pass: create all task objects
        for (const t of data) {
          const task: GanttTask = {
            id: t.id.toString(),
            text: t.name,
            start: new Date(t.startDate),
            end: new Date(t.endDate),
            progress: t.progress,
          };
          taskMap.set(t.id.toString(), task);
        }

        // Second pass: build hierarchy
        for (const t of data) {
          const task = taskMap.get(t.id.toString());
          if (!task) continue;

          if (t.parentTaskId !== null) {
            const parent = taskMap.get(t.parentTaskId.toString());
            if (parent) {
              if (!parent.data) parent.data = [];
              parent.data.push(task);
            }
          } else {
            rootTasks.push(task);
          }
        }

        if (!cancelled) {
          setTasks(rootTasks);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTasks();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleTaskAction = async (ev: { action: string; data: { [key: string]: any } }) => {
    if (ev.action === 'update-task') {
      const { id, start, end, progress } = ev.data;
      try {
        const response = await fetch(`/api/scheduling/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            progress: progress,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to update task: ${response.status}`);
        }
        // Refresh tasks after update
        const response2 = await fetch(`/api/scheduling/tasks?projectId=${projectId}`);
        const taskData = await response2.json();
        // Rebuild tree (same logic as above)
        const taskMap = new Map<string, GanttTask>();
        const rootTasks: GanttTask[] = [];
        for (const t of taskData) {
          const task: GanttTask = {
            id: t.id.toString(),
            text: t.name,
            start: new Date(t.startDate),
            end: new Date(t.endDate),
            progress: t.progress,
          };
          taskMap.set(t.id.toString(), task);
        }
        for (const t of taskData) {
          const task = taskMap.get(t.id.toString());
          if (!task) continue;
          if (t.parentTaskId !== null) {
            const parent = taskMap.get(t.parentTaskId.toString());
            if (parent) {
              if (!parent.data) parent.data = [];
              parent.data.push(task);
            }
          } else {
            rootTasks.push(task);
          }
        }
        setTasks(rootTasks);
      } catch (err) {
        console.error('Error updating task:', err);
      }
    }
    if (ev.action === 'add-task') {
      const { text, start, end } = ev.data;
      try {
        const response = await fetch('/api/scheduling/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: parseInt(projectId),
            name: text,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to add task: ${response.status}`);
        }
        // Refresh tasks after add
        const response2 = await fetch(`/api/scheduling/tasks?projectId=${projectId}`);
        const taskData = await response2.json();
        const taskMap = new Map<string, GanttTask>();
        const rootTasks: GanttTask[] = [];
        for (const t of taskData) {
          const task: GanttTask = {
            id: t.id.toString(),
            text: t.name,
            start: new Date(t.startDate),
            end: new Date(t.endDate),
            progress: t.progress,
          };
          taskMap.set(t.id.toString(), task);
        }
        for (const t of taskData) {
          const task = taskMap.get(t.id.toString());
          if (!task) continue;
          if (t.parentTaskId !== null) {
            const parent = taskMap.get(t.parentTaskId.toString());
            if (parent) {
              if (!parent.data) parent.data = [];
              parent.data.push(task);
            }
          } else {
            rootTasks.push(task);
          }
        }
        setTasks(rootTasks);
      } catch (err) {
        console.error('Error adding task:', err);
      }
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: '100%', minHeight: '400px' }}>
      <Gantt
        tasks={tasks}
        onaction={handleTaskAction}
        // Optional: customize toolbar, columns, etc.
        // Uncomment and adjust as needed
        // columns={[
        //   { text: 'Task', key: 'text', width: 200 },
        //   { text: 'Start', key: 'start', width: 100 },
        //   { text: 'End', key: 'end', width: 100 },
        //   { text: 'Progress', key: 'progress', width: 100 },
        // ]}
      />
    </div>
  );
}