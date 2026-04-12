'use client';

import { useState, useEffect, useMemo } from 'react';
import { Gantt, Toolbar, Willow, Editor } from '@svar-ui/react-gantt';
import { RestDataProvider } from '@svar-ui/gantt-data-provider';
import '@svar-ui/react-gantt/all.css';
import type { ITask, ILink, IApi } from '@svar-ui/react-gantt';

const scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'week', step: 1, format: 'Wk %W' },
];

class ApiDataProvider extends RestDataProvider {
  constructor() {
    super('/api/scheduling');
  }

  override async getData(id?: number | string): Promise<{ tasks: ITask[]; links: ILink[] }> {
    const [tasksResp, linksResp] = await Promise.all([
      this.send<any>(id ? `tasks/${id}` : 'tasks', 'GET'),
      this.send<any>(id ? `links/${id}` : 'links', 'GET'),
    ]);

    const rawTasks: any[] = Array.isArray(tasksResp)
      ? tasksResp
      : Array.isArray((tasksResp as any)?.data)
      ? (tasksResp as any).data
      : [];

    const rawLinks: any[] = Array.isArray(linksResp)
      ? linksResp
      : Array.isArray((linksResp as any)?.data)
      ? (linksResp as any).data
      : [];

    const tasks: ITask[] = rawTasks.map(t => ({
      id: t.id,
      text: t.name ?? t.text ?? '',
      start: new Date(t.start ?? t.startDate),
      end: t.end ? new Date(t.end) : t.endDate ? new Date(t.endDate) : undefined,
      duration: t.duration ?? t.durationDays ?? 1,
      progress: t.progress ?? (t.percentComplete ?? 0) / 100,
      parent: t.parent ?? t.parentTaskId ?? 0,
      type: (t.type as ITask['type']) ?? 'task',
      open: true,
    }));

    const links: ILink[] = rawLinks.map(l => ({
      id: l.id,
      source: l.taskId,
      target: l.dependsOnTaskId,
      type: l.type ?? 'FS',
      lag: l.lagDays ?? 0,
    }));

    return { tasks, links };
  }
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [api, setApi] = useState<IApi | null>(null);
  const server = useMemo(() => new ApiDataProvider(), []);

  const init = (ganttApi: IApi) => {
    ganttApi.setNext(server);
    setApi(ganttApi);
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Willow>
        <Toolbar api={api ?? undefined} />
        <Gantt
          scales={scales}
          init={init}
          readonly={false}
          cellHeight={36}
          scaleHeight={60}
        />
        {api && <Editor api={api} />}
      </Willow>
    </div>
  );
}
