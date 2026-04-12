'use client';

import { useState, useEffect } from 'react';
import { Gantt, Willow } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import type { ITask, ILink } from '@svar-ui/gantt-store';

const scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'day', step: 1, format: '%j' },
];

function normalizeTask(t: any): ITask {
  return {
    id: t.id,
    text: String(t.name || t.text || ''),
    start: t.startDate ? new Date(t.startDate) : undefined,
    end: t.endDate ? new Date(t.endDate) : undefined,
    duration: typeof t.durationDays === 'number' ? t.durationDays : 1,
    progress: typeof t.percentComplete === 'number' ? t.percentComplete / 100 : 0,
    type: t.type || 'task',
    // SVAR uses parent=0 (or absent) for root-level tasks
    parent: t.parentTaskId ?? 0,
    open: true,
  };
}

function normalizeLink(l: any): ILink {
  return {
    id: l.id,
    source: l.taskId,
    target: l.dependsOnTaskId,
    type: (l.type as ILink['type']) || 'FS',
    lag: typeof l.lagDays === 'number' ? l.lagDays : 0,
  };
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);

  useEffect(() => {
    const base = '/api/scheduling';
    Promise.all([
      fetch(`${base}/tasks`).then(r => r.json()),
      fetch(`${base}/links`).then(r => r.json()),
    ]).then(([taskData, linkData]) => {
      const rawTasks: any[] = Array.isArray(taskData) ? taskData : (taskData?.data ?? []);
      const rawLinks: any[] = Array.isArray(linkData) ? linkData : (linkData?.data ?? []);

      setTasks(rawTasks.map(normalizeTask));
      setLinks(rawLinks.map(normalizeLink));
    }).catch(err => {
      console.error('Failed to load scheduling data:', err);
    });
  }, [projectId]);

  return (
    <Willow>
      <Gantt
        tasks={tasks}
        links={links}
        scales={scales}
        cellHeight={36}
        scaleHeight={60}
      />
    </Willow>
  );
}