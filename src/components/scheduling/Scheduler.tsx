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

function toGanttLink(d: DepResponse) {
  return {
    id: d.id,
    source: d.dependsOnTaskId,
    target: d.taskId,
    type: d.type === 'SS' ? 's2s' : d.type === 'SF' ? 's2e' : 'e2e',
  };
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [api, setApi] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Load data and push into SVAR via API
  const loadData = useCallback(async () => {
    if (!api || !projectId) return;
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

      const ganttTasks = taskData.map(toGanttTask);
      const ganttLinks = depData.map(toGanttLink);

      api.exec('setTasks', ganttTasks);
      api.exec('setLinks', ganttLinks);
    } catch (e) {
      console.error('[Scheduler] loadData error:', e);
    }
  }, [api, projectId]);

  // Load on mount once api is ready
  useEffect(() => {
    if (api && !ready) {
      setReady(true);
      loadData();
    }
  }, [api, ready, loadData]);

  // SVAR init
  function handleInit(apiRef: any) {
    setApi(apiRef);

    apiRef.on('after-task-add', async (config: any) => {
      const t = config.data;
      if (!t?.text || !t?.start || !t?.duration) return;
      try {
        const endDate = new Date(new Date(t.start).getTime() + t.duration * 86400000);
        await fetch('/api/scheduling/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: parseInt(projectId),
            name: t.text,
            startDate: new Date(t.start).toISOString(),
            endDate: endDate.toISOString(),
            durationDays: t.duration,
          }),
        });
        await loadData();
      } catch (e) {
        console.error('[Scheduler] add task error:', e);
      }
    });

    apiRef.on('after-task-update', async (config: any) => {
      const t = config.data;
      if (!t?.id) return;
      try {
        const body: Record<string, unknown> = {};
        if (t.text !== undefined) body.name = t.text;
        if (t.start !== undefined) {
          body.startDate = new Date(t.start).toISOString();
          body.durationDays = t.duration ?? 1;
          body.endDate = new Date(new Date(t.start).getTime() + (t.duration ?? 1) * 86400000).toISOString();
        }
        if (t.progress !== undefined) body.percentComplete = Math.round(t.progress * 100);
        await fetch(`/api/scheduling/tasks/${t.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        await loadData();
      } catch (e) {
        console.error('[Scheduler] update task error:', e);
      }
    });

    apiRef.on('after-link-add', async (config: any) => {
      const link = config.data;
      if (link?.source == null || link?.target == null) return;
      const typeMap: Record<string, string> = { e2e: 'FS', s2s: 'SS', s2e: 'SF' };
      try {
        await fetch('/api/scheduling/dependencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: link.target,
            dependsOnTaskId: link.source,
            type: typeMap[link.type ?? 'e2e'] ?? 'FS',
            lagDays: 0,
          }),
        });
        await loadData();
      } catch (e) {
        console.error('[Scheduler] add link error:', e);
      }
    });

    apiRef.on('before-task-delete', async (config: any) => {
      if (config.id == null) return;
      try {
        await fetch(`/api/scheduling/tasks/${config.id}`, { method: 'DELETE' });
        await loadData();
      } catch (e) {
        console.error('[Scheduler] delete task error:', e);
      }
    });
  }

  return (
    <Willow>
      {/* Toolbar */}
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
      </div>

      <Gantt
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
