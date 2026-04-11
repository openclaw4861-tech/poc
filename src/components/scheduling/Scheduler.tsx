'use client';

import { useState, useEffect } from 'react';
import { Gantt, Toolbar, Willow, Editor } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import type { ITask, ILink, IApi } from '@svar-ui/react-gantt';

const apiUrl = '/api/scheduling';

const scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'week', step: 1, format: 'Wk %W' },
];

interface TaskDb {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  percentComplete: number;
  parentTaskId: number | null;
}

interface DepDb {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: string;
  lagDays: number;
}

// Convert DB row → SVAR ITask
function toGanttTask(t: TaskDb): ITask {
  return {
    id: t.id,
    text: t.name,
    start: new Date(t.startDate),
    end: new Date(t.endDate),
    duration: t.durationDays,
    progress: (t.percentComplete ?? 0) / 100,
    parent: t.parentTaskId ?? 0,
    type: 'task',
    open: true,
  };
}

function toGanttLink(d: DepDb): ILink {
  return {
    id: d.id,
    source: d.dependsOnTaskId,
    target: d.taskId,
    type: d.type === 'SS' ? 's2s' : d.type === 'SF' ? 's2e' : 'e2e',
  };
}

interface SchedulerProps {
  projectId: string;
}

export default function Scheduler({ projectId }: SchedulerProps) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);
  const [api, setApi] = useState<IApi | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Load tasks from our API
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      fetch(`${apiUrl}/tasks?projectId=${projectId}`).then(r => r.json()),
      fetch(`${apiUrl}/links?projectId=${projectId}`).then(r => r.json()),
    ]).then(([tasksJson, linksJson]) => {
      const rawTasks: TaskDb[] = Array.isArray(tasksJson) ? tasksJson
        : Array.isArray(tasksJson?.data) ? tasksJson.data : [];
      const rawLinks: DepDb[] = Array.isArray(linksJson) ? linksJson
        : Array.isArray(linksJson?.data) ? linksJson.data : [];

      const loadedTasks = rawTasks.map(toGanttTask);
      const loadedLinks = rawLinks.map(toGanttLink);

      setTasks(loadedTasks);
      setLinks(loadedLinks);

      // If API is ready, push tasks into SVAR too
      if (api) {
        api.exec('setTasks', loadedTasks);
        api.exec('setLinks', loadedLinks);
      }
    }).catch(e => {
      console.error('[Scheduler] load error:', e);
    }).finally(() => {
      setLoading(false);
    });
  }, [projectId]);

  function initApi(apiRef: IApi) {
    setApi(apiRef);

    // Push already-loaded tasks into SVAR
    if (tasks.length > 0) {
      apiRef.exec('setTasks', tasks);
      apiRef.exec('setLinks', links);
    }

    // Wire SVAR actions → our REST API
    apiRef.on('after-task-add', async (config: any) => {
      const t = config.data ?? config;
      setSaveStatus('Saving task...');
      try {
        const start = t.start instanceof Date ? t.start : new Date(t.start as string);
        const end = t.end instanceof Date ? t.end : new Date(t.end as string);
        const duration = t.duration ?? Math.round((end.getTime() - start.getTime()) / 86400000);

        const res = await fetch(`${apiUrl}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: parseInt(projectId),
            name: t.text ?? '',
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            durationDays: duration,
            percentComplete: Math.round((t.progress ?? 0) * 100),
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const saved = await res.json();
        const savedTask = saved?.data;
        if (savedTask) {
          // Update SVAR's in-memory ID to the server-assigned ID
          apiRef.exec('setTask', { ...t, id: savedTask.id });
        }
      } catch (e) {
        console.error('[Scheduler] add error:', e);
        setSaveStatus('Save failed');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }
      setSaveStatus('');
    });

    apiRef.on('after-task-update', async (config: any) => {
      const t = config.data ?? config;
      if (t.id == null) return;
      setSaveStatus('Saving...');
      try {
        const body: Record<string, unknown> = {};
        if (t.text !== undefined) body.name = t.text;
        if (t.start !== undefined) {
          const start = t.start instanceof Date ? t.start : new Date(t.start as string);
          body.startDate = start.toISOString();
        }
        if (t.end !== undefined) {
          const end = t.end instanceof Date ? t.end : new Date(t.end as string);
          body.endDate = end.toISOString();
        }
        if (t.duration !== undefined) body.durationDays = t.duration;
        if (t.progress !== undefined) body.percentComplete = Math.round(t.progress * 100);

        const res = await fetch(`${apiUrl}/tasks/${t.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (e) {
        console.error('[Scheduler] update error:', e);
        setSaveStatus('Save failed');
        setTimeout(() => setSaveStatus(''), 3000);
        return;
      }
      setSaveStatus('');
    });

    apiRef.on('before-task-delete', async (config: any) => {
      if (config.id == null) return;
      try {
        await fetch(`${apiUrl}/tasks/${config.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('[Scheduler] delete error:', e);
      }
    });

    apiRef.on('after-link-add', async (config: any) => {
      const l = config.data ?? config;
      if (l.source == null || l.target == null) return;
      const typeMap: Record<string, string> = { e2e: 'FS', s2s: 'SS', s2e: 'SF' };
      try {
        const res = await fetch(`${apiUrl}/dependencies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: l.target,
            dependsOnTaskId: l.source,
            type: typeMap[l.type ?? 'e2e'] ?? 'FS',
            lagDays: 0,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
      } catch (e) {
        console.error('[Scheduler] link add error:', e);
      }
    });

    apiRef.on('after-link-delete', async (config: any) => {
      if (config.id == null) return;
      try {
        await fetch(`${apiUrl}/dependencies/${config.id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('[Scheduler] link delete error:', e);
      }
    });
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Status bar */}
      <div style={{
        padding: '6px 16px',
        background: saveStatus ? '#fef9c3' : '#f0fdf4',
        borderBottom: '1px solid #e2e8f0',
        fontSize: 12,
        color: saveStatus ? '#92400e' : '#166534',
        minHeight: 28,
      }}>
        {loading ? 'Loading tasks...' : saveStatus || `${tasks.length} task${tasks.length !== 1 ? 's' : ''} loaded`}
      </div>

      <Willow>
        <Toolbar api={api} />
        <Gantt
          tasks={tasks}
          links={links}
          scales={scales}
          init={initApi}
          readonly={false}
          cellHeight={36}
          scaleHeight={60}
        />
        {api && <Editor api={api} />}
      </Willow>
    </div>
  );
}
