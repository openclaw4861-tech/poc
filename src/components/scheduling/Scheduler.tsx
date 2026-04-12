'use client';

import { useState, useEffect } from 'react';
import { Gantt, Willow } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import type { ITask, ILink } from '@svar-ui/react-gantt';

const scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'day', step: 1, format: '%j' },
];

export default function Scheduler({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);

  useEffect(() => {
    const base = '/api/scheduling';
    Promise.all([
      fetch(`${base}/tasks`).then(r => r.json()),
      fetch(`${base}/links`).then(r => r.json()),
    ]).then(([taskData, linkData]) => {
      // Normalize tasks: DB uses startDate/durationDays, ITask uses start/duration
      const loadedTasks: ITask[] = (taskData ?? []).map((t: any) => ({
        id: t.id,
        text: t.name ?? t.text ?? '',
        start: new Date(t.startDate ?? t.start),
        duration: t.durationDays ?? t.duration ?? 1,
        progress: (t.percentComplete ?? 0) / 100,
        type: (t.type as ITask['type']) ?? 'task',
        open: true,
      }));

      const loadedLinks: ILink[] = (linkData ?? []).map((l: any) => ({
        id: l.id,
        source: l.taskId,
        target: l.dependsOnTaskId,
        type: l.type ?? 'FS',
      }));

      setTasks(loadedTasks);
      setLinks(loadedLinks);
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