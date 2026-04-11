'use client';

import { useEffect, useState, useCallback } from 'react';
import { Gantt, Willow } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';

interface TaskResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  percentComplete: number;
  parentTaskId: number | null;
}

interface DepResponse {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: string;
  lagDays: number;
}

// Convert DB task → SVAR Gantt task
function toGanttTask(t: TaskResponse) {
  return {
    id: t.id,
    text: t.name,
    start: new Date(t.startDate),
    duration: t.durationDays,
    progress: t.percentComplete / 100,
    parent: t.parentTaskId ?? 0,
    type: 'task' as const,
    open: true,
  };
}

// Convert DB dependency → SVAR Gantt link
// SVAR types: e2e=FS, e2s=FS, s2s=SS, s2e=SF
function toGanttLink(d: DepResponse) {
  const typeMap: Record<string, string> = {
    FS: 'e2e',
    SS: 's2s',
    FF: 'e2e',
    SF: 's2e',
  };
  return {
    id: d.id,
    source: d.dependsOnTaskId,
    target: d.taskId,
    type: typeMap[d.type] ?? 'e2e',
  };
}

// Parse date string to Date
function parseDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

interface SchedulerProps {
  projectId: string;
}

type ViewMode = 'day' | 'week' | 'month';

const SCALES: Record<ViewMode, Array<{ unit: string; step: number; format: string }>> = {
  day: [
    { unit: 'month', step: 1, format: '%F %Y' },
    { unit: 'day', step: 1, format: '%j' },
  ],
  week: [
    { unit: 'month', step: 1, format: '%F %Y' },
    { unit: 'week', step: 1, format: '%W' },
  ],
  month: [
    { unit: 'year', step: 1, format: '%Y' },
    { unit: 'month', step: 1, format: '%M' },
  ],
};

const COLUMNS = [
  { id: 'text', header: 'Task name', flexgrow: 2 },
  { id: 'start', header: 'Start', flexgrow: 1, align: 'center' as const },
  { id: 'duration', header: 'Days', flexgrow: 1, align: 'center' as const },
];

export default function Scheduler({ projectId }: SchedulerProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [links, setLinks] = useState<DepResponse[]>([]);
  const [ganttTasks, setGanttTasks] = useState<ReturnType<typeof toGanttTask>[]>([]);
  const [ganttLinks, setGanttLinks] = useState<ReturnType<typeof toGanttLink>[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<{ id?: number; name: string; start: string; duration: number } | null>(null);

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [tasksRes, depsRes] = await Promise.all([
        fetch(`/api/scheduling/tasks?projectId=${projectId}`),
        fetch(`/api/scheduling/dependencies?projectId=${projectId}`),
      ]);
      const tasksRaw = await tasksRes.json();
      const depsRaw = await depsRes.json();
      const taskData: TaskResponse[] = Array.isArray(tasksRaw) ? tasksRaw : Array.isArray(tasksRaw.data) ? tasksRaw.data : [];
      const depData: DepResponse[] = Array.isArray(depsRaw) ? depsRaw : Array.isArray(depsRaw.data) ? depsRaw.data : [];

      setTasks(taskData);
      setLinks(depData);
      setGanttTasks(taskData.map(toGanttTask));
      setGanttLinks(depData.map(toGanttLink));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleTaskAdd(task: { text: string; start: Date; duration: number }) {
    try {
      const res = await fetch('/api/scheduling/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          name: task.text,
          startDate: task.start.toISOString(),
          endDate: new Date(task.start.getTime() + task.duration * 86400000).toISOString(),
          durationDays: task.duration,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await fetchAll();
    } catch (e) {
      console.error('Error adding task:', e);
    }
  }

  async function handleTaskUpdate(task: { id: number; text?: string; start?: Date; duration?: number; progress?: number }) {
    try {
      const body: Record<string, unknown> = {};
      if (task.text !== undefined) body.name = task.text;
      if (task.start !== undefined) {
        body.startDate = task.start.toISOString();
        const endDate = new Date(task.start.getTime() + (task.duration ?? 1) * 86400000);
        body.endDate = endDate.toISOString();
      }
      if (task.duration !== undefined) body.durationDays = task.duration;
      if (task.progress !== undefined) body.percentComplete = Math.round(task.progress * 100);

      const res = await fetch(`/api/scheduling/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      await fetchAll();
    } catch (e) {
      console.error('Error updating task:', e);
    }
  }

  async function handleLinkAdd(link: { source: number; target: number; type: string }) {
    try {
      await fetch('/api/scheduling/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: link.target,
          dependsOnTaskId: link.source,
          type: link.type === 'e2e' ? 'FS' : link.type === 's2s' ? 'SS' : link.type === 's2e' ? 'SF' : 'FS',
          lagDays: 0,
        }),
      });
      await fetchAll();
    } catch (e) {
      console.error('Error adding link:', e);
    }
  }

  async function handleTaskDelete(id: number) {
    try {
      await fetch(`/api/scheduling/tasks/${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading schedule...</div>;

  return (
    <Willow>
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TIMESCALE:</span>
        {(['day', 'week', 'month'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              border: '1px solid',
              borderColor: viewMode === m ? '#2563eb' : '#cbd5e1',
              background: viewMode === m ? '#2563eb' : '#fff',
              color: viewMode === m ? '#fff' : '#475569',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {m === 'day' ? 'Day' : m === 'week' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      <Gantt
        tasks={ganttTasks}
        links={ganttLinks}
        scales={SCALES[viewMode]}
        columns={COLUMNS}
        init={setApi}
        onInlineEditorOpening={false as any}
        onBeforeTaskAdd={false as any}
        onAfterTaskAdd={(task: any) => {
          if (task.text && task.start && task.duration) {
            handleTaskAdd(task);
          }
        }}
        onAfterTaskUpdate={(task: any) => {
          handleTaskUpdate({
            id: task.id,
            text: task.text,
            start: task.start,
            duration: task.duration,
            progress: task.progress,
          });
        }}
        onAfterLinkAdd={(link: any) => {
          if (link.source && link.target) {
            handleLinkAdd({ source: link.source, target: link.target, type: link.type ?? 'e2e' });
          }
        }}
        onBeforeTaskDelete={({ id }: { id: number }) => {
          handleTaskDelete(id);
          return false; // suppress default delete
        }}
      />
    </Willow>
  );
}
