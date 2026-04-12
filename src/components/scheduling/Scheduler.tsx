'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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

    const rawTasks: any[] = Array.isArray(tasksResp) ? tasksResp
      : Array.isArray((tasksResp as any)?.data) ? (tasksResp as any).data : [];
    const rawLinks: any[] = Array.isArray(linksResp) ? linksResp
      : Array.isArray((linksResp as any)?.data) ? (linksResp as any).data : [];

    return {
      tasks: this.parseDates(rawTasks),
      links: rawLinks,
    };
  }
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);
  const [api, setApi] = useState<IApi | undefined>(undefined);

  const server = useMemo(() => new ApiDataProvider(), []);

  useEffect(() => {
    setMounted(true);
    server.getData().then((data: { tasks: ITask[]; links: ILink[] }) => {
      setTasks(data.tasks ?? []);
      setLinks(data.links ?? []);
    }).catch((err: unknown) => {
      console.error('[Scheduler] getData rejected:', err);
    });
  }, [server]);

  const init = useCallback((ganttApi: IApi) => {
    setApi(ganttApi);
    ganttApi.setNext(server);
  }, [server]);

  if (!mounted) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Willow>
        <Toolbar api={api} />
        <Gantt
          tasks={tasks}
          links={links}
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
