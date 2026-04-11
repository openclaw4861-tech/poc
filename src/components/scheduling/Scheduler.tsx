'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Gantt, Toolbar, Willow, Editor } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';
import type { ITask, ILink, IApi } from '@svar-ui/react-gantt';

const apiUrl = '/api/scheduling';

const scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'week', step: 1, format: 'Wk %W' },
];

/** Minimal data provider that handles our { success: true, data: [...] } response format */
class ApiDataProvider {
  private base: string;

  constructor() {
    this.base = window.location.origin + apiUrl;
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(this.base + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json as T;
  }

  private async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json as any)?.data ?? json;
  }

  private async put<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(this.base + path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json as any)?.data ?? json;
  }

  private async del<T>(path: string): Promise<T> {
    const res = await fetch(this.base + path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json as any)?.data ?? json;
  }

  // Parse date strings from DB into JS Date objects — SVAR requires Date objects
  private parseDates(tasks: any[]): ITask[] {
    return tasks.map(t => ({
      ...t,
      start: new Date(t.start ?? t.startDate),
      end: t.end ? new Date(t.end) : undefined,
    }));
  }

  async getData(): Promise<{ tasks: ITask[]; links: ILink[] }> {
    const [tasksResp, linksResp] = await Promise.all([
      this.get<any>('/tasks'),
      this.get<any>('/links'),
    ]);

    const rawTasks: any[] = Array.isArray(tasksResp) ? tasksResp
      : Array.isArray(tasksResp?.data) ? tasksResp.data : [];
    const rawLinks: any[] = Array.isArray(linksResp) ? linksResp
      : Array.isArray(linksResp?.data) ? linksResp.data : [];

    return {
      tasks: this.parseDates(rawTasks),
      links: rawLinks,
    };
  }

  // Called by SVAR via api.setNext(provider)
  async addTask(task: Partial<ITask> & { mode?: string; target?: number }) {
    return this.post('/tasks', {
      name: task.text,
      startDate: task.start instanceof Date ? task.start.toISOString() : task.start,
      endDate: task.end instanceof Date ? task.end.toISOString() : task.end,
      durationDays: task.duration,
      percentComplete: Math.round((task.progress ?? 0) * 100),
      parentTaskId: task.parent && task.parent !== 0 ? task.parent : null,
    });
  }

  async updateTask(task: Partial<ITask> & { id: number | string }) {
    const body: Record<string, unknown> = {};
    if (task.text !== undefined) body.name = task.text;
    if (task.start !== undefined) body.startDate = (task.start instanceof Date ? task.start : new Date(task.start as any)).toISOString();
    if (task.end !== undefined) body.endDate = (task.end instanceof Date ? task.end : new Date(task.end as any)).toISOString();
    if (task.duration !== undefined) body.durationDays = task.duration;
    if (task.progress !== undefined) body.percentComplete = Math.round(task.progress * 100);
    return this.put(`/tasks/${task.id}`, body);
  }

  async deleteTask(id: number | string) {
    return this.del(`/tasks/${id}`);
  }

  async addLink(link: { source: number; target: number; type: string }) {
    const typeMap: Record<string, string> = { e2e: 'FS', s2s: 'SS', s2e: 'SF', e2s: 'FS' };
    return this.post('/dependencies', {
      taskId: link.target,
      dependsOnTaskId: link.source,
      type: typeMap[link.type] ?? 'FS',
      lagDays: 0,
    });
  }

  async deleteLink(id: number | string) {
    return this.del(`/dependencies/${id}`);
  }
}

export default function Scheduler({ projectId }: { projectId: string }) {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [links, setLinks] = useState<ILink[]>([]);
  const [api, setApi] = useState<IApi | undefined>(undefined);

  const provider = useMemo(() => new ApiDataProvider(), []);

  useEffect(() => {
    setMounted(true);
    provider.getData().then((data) => {
      setTasks(data.tasks ?? []);
      setLinks(data.links ?? []);
    });
  }, [provider]);

  const init = useCallback((ganttApi: IApi) => {
    setApi(ganttApi);
    // Wire all SVAR actions to our custom provider methods
    ganttApi.on('after-task-add', async (config: any) => {
      try { await provider.addTask(config.data); } catch (e) { console.error(e); }
    });
    ganttApi.on('after-task-update', async (config: any) => {
      try { await provider.updateTask(config.data); } catch (e) { console.error(e); }
    });
    ganttApi.on('before-task-delete', async (config: any) => {
      try { await provider.deleteTask(config.id); } catch (e) { console.error(e); }
    });
    ganttApi.on('after-link-add', async (config: any) => {
      try { await provider.addLink(config.data); } catch (e) { console.error(e); }
    });
    ganttApi.on('after-link-delete', async (config: any) => {
      try { await provider.deleteLink(config.id); } catch (e) { console.error(e); }
    });
  }, [provider]);

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
