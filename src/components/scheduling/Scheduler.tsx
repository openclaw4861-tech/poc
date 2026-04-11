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

// Convert DB task → SVAR Gantt task
function toGanttTask(t: TaskResponse) {
  return {
    id: t.id,
    text: t.name,
    start: new Date(t.startDate),
    duration: t.durationDays,
    progress: (t.percentComplete ?? 0) / 100,
    parent: t.parentTaskId ?? 0,
    type: 'task',
    open: true,
  };
}

// Convert DB dependency → SVAR Gantt link
function toGanttLink(d: DepResponse) {
  return {
    id: d.id,
    source: d.dependsOnTaskId,
    target: d.taskId,
    type: d.type === 'SS' ? 's2s' : d.type === 'SF' ? 's2e' : 'e2e',
  };
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [links, setLinks] = useState<DepResponse[]>([]);
  const [ganttTasks, setGanttTasks] = useState<ReturnType<typeof toGanttTask>[]>([]);
  const [ganttLinks, setGanttLinks] = useState<ReturnType<typeof toGanttLink>[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>(null);

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    try {
      const [tasksRes, depsRes] = await Promise.all([
        fetch(`/api/scheduling/tasks?projectId=${projectId}`),
        fetch(`/api/scheduling/dependencies?projectId=${projectId}`),
      ]);
      const tasksRaw = await tasksRes.json();
      const depsRaw = await depsRes.json();

      const taskData: TaskResponse[] = Array.isArray(tasksRaw) ? tasksRaw
        : Array.isArray(tasksRaw?.data) ? tasksRaw.data : [];

      const depData: DepResponse[] = Array.isArray(depsRaw) ? depsRaw
        : Array.isArray(depsRaw?.data) ? depsRaw.data : [];

      setTasks(taskData);
      setLinks(depData);
      setGanttTasks(taskData.map(toGanttTask));
      setGanttLinks(depData.map(toGanttLink));
    } catch (e) {
      console.error('[Scheduler] fetchAll error:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Refresh SVAR when data changes
  useEffect(() => {
    if (!api) return;
    api.exec('setTasks', ganttTasks);
    api.exec('setLinks', ganttLinks);
  }, [api, ganttTasks, ganttLinks]);

  // Task add via SVAR inline editor
  async function handleTaskAdd(task: { text: string; start: Date; duration: number }) {
    try {
      const endDate = new Date(task.start.getTime() + task.duration * 86400000);
      const res = await fetch('/api/scheduling/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          name: task.text,
          startDate: task.start.toISOString(),
          endDate: endDate.toISOString(),
          durationDays: task.duration,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
    } catch (e) {
      console.error('[Scheduler] add task error:', e);
    }
  }

  // Task update via SVAR inline editor
  async function handleTaskUpdate(task: { id: number; text?: string; start?: Date; duration?: number; progress?: number }) {
    try {
      const body: Record<string, unknown> = {};
      if (task.text !== undefined) body.name = task.text;
      if (task.start !== undefined) {
        body.startDate = task.start.toISOString();
        body.durationDays = task.duration ?? 1;
        body.endDate = new Date(task.start.getTime() + (task.duration ?? 1) * 86400000).toISOString();
      }
      if (task.progress !== undefined) body.percentComplete = Math.round(task.progress * 100);

      const res = await fetch(`/api/scheduling/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
    } catch (e) {
      console.error('[Scheduler] update task error:', e);
    }
  }

  // Link add via SVAR drag
  async function handleLinkAdd(link: { source: number; target: number; type: string }) {
    try {
      const typeMap: Record<string, string> = { e2e: 'FS', s2s: 'SS', s2e: 'SF' };
      const res = await fetch('/api/scheduling/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: link.target,
          dependsOnTaskId: link.source,
          type: typeMap[link.type] ?? 'FS',
          lagDays: 0,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchAll();
    } catch (e) {
      console.error('[Scheduler] add link error:', e);
    }
  }

  // Task delete via SVAR context menu or keyboard
  async function handleTaskDelete(id: number) {
    try {
      await fetch(`/api/scheduling/tasks/${id}`, { method: 'DELETE' });
      await fetchAll();
    } catch (e) {
      console.error('[Scheduler] delete task error:', e);
    }
  }

  // Wire SVAR events once api is available
  function handleInit(apiRef: any) {
    setApi(apiRef);

    // Inline task add (when user clicks + in grid)
    apiRef.on('after-task-add', (config: any) => {
      const task = config.data;
      if (task?.text && task?.start && task?.duration) {
        handleTaskAdd(task);
      }
    });

    // Inline task update (when user edits a task inline)
    apiRef.on('after-task-update', (config: any) => {
      const task = config.data;
      if (task?.id) {
        handleTaskUpdate({
          id: task.id,
          text: task.text,
          start: task.start,
          duration: task.duration,
          progress: task.progress,
        });
      }
    });

    // Link created by dragging between tasks
    apiRef.on('after-link-add', (config: any) => {
      const link = config.data;
      if (link?.source != null && link?.target != null) {
        handleLinkAdd({ source: link.source, target: link.target, type: link.type ?? 'e2e' });
      }
    });

    // Delete
    apiRef.on('before-task-delete', (config: any) => {
      if (config.id != null) handleTaskDelete(config.id);
    });
  }

  if (loading) return <div style={{ padding: 24, color: '#64748b' }}>Loading schedule...</div>;

  return (
    <Willow>
      {/* Toolbar row */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e2e8f0', alignItems: 'center', background: '#fff' }}>
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TIMESCALE:</span>
        {(['day', 'week', 'month'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            style={{
              padding: '4px 12px',
              fontSize: 12,
              border: '1px solid',
              borderColor: viewMode === m ? '#16a34a' : '#cbd5e1',
              background: viewMode === m ? '#16a34a' : '#fff',
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
        <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* SVAR Gantt — readonly=false enables inline editing */}
      <Gantt
        tasks={ganttTasks}
        links={ganttLinks}
        scales={SCALES[viewMode]}
        columns={COLUMNS}
        init={handleInit}
        readonly={false}
        cellHeight={36}
        scaleHeight={60}
        cellBorders="column"
      />
    </Willow>
  );
}
