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

/** Wraps our { success: true, data: [...] } API in the shape RestDataProvider expects */
class ApiDataProvider extends RestDataProvider {
  constructor() {
    super('/api/scheduling');
  }

  override async getData(id?: number | string): Promise<{ tasks: ITask[]; links: ILink[] }> {
    console.log('[ApiDataProvider] getData called, id=', id);
    const [tasksResp, linksResp] = await Promise.all([
      this.send<any>(id ? `tasks/${id}` : 'tasks', 'GET'),
      this.send<any>(id ? `links/${id}` : 'links', 'GET'),
    ]);
    console.log('[ApiDataProvider] tasksResp:', JSON.stringify(tasksResp)?.slice(0, 200));

    // Unwrap { success: true, data: [...] } → [...]
    const rawTasks: any[] = Array.isArray(tasksResp) ? tasksResp
      : Array.isArray((tasksResp as any)?.data) ? (tasksResp as any).data : [];
    const rawLinks: any[] = Array.isArray(linksResp) ? linksResp
      : Array.isArray((linksResp as any)?.data) ? (linksResp as any).data : [];
    console.log('[ApiDataProvider] rawTasks count:', rawTasks.length, 'rawLinks:', rawLinks.length);

    const tasks = this.parseDates(rawTasks);
    console.log('[ApiDataProvider] parsed tasks:', tasks.length);
    return { tasks, links: rawLinks };
  }
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<IApi | undefined>(undefined);

  const server = useMemo(() => new ApiDataProvider(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const init = useCallback((ganttApi: IApi) => {
    setApi(ganttApi);
    console.log('[Scheduler] init called, setting next handler');
    ganttApi.setNext(server);
    console.log('[Scheduler] next handler set');
  }, [server]);

  if (!mounted) {
    return <div style={{ height: '100%', width: '100%' }} />;
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Willow>
        <Toolbar api={api} />
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
