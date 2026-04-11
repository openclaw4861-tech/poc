'use client';

import { useEffect, useState, useRef } from 'react';

interface GanttTask {
  id: string;
  text: string;
  start: Date;
  end: Date;
  progress: number; // 0-100
  data?: GanttTask[];
}

interface TaskResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  parentTaskId: number | null;
}

interface SchedulerProps {
  projectId: string;
  onProjectNameChange?: (name: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

// Per-view column width and the day-count each column represents
const COL_WIDTH: Record<ViewMode, number> = { day: 40, week: 140, month: 480 };
const DAYS_PER_COL: Record<ViewMode, number> = { day: 1, week: 7, month: 30 };
// Zoom levels: Day=40px/day, Week=24px/7d22483.4px/day, Month=32px/30d22481.1px/day
const ROW_HEIGHT = 40;
const LABEL_WIDTH = 240;
const HEADER_HEIGHT = 60;

function buildTree(tasks: TaskResponse[]): GanttTask[] {
  const map = new Map<string, GanttTask>();
  const roots: GanttTask[] = [];

  for (const t of tasks) {
    map.set(String(t.id), {
      id: String(t.id),
      text: t.name,
      start: new Date(t.startDate),
      end: new Date(t.endDate),
      progress: t.progress ?? 0,
    });
  }

  for (const t of tasks) {
    const node = map.get(String(t.id))!;
    if (t.parentTaskId !== null) {
      const parent = map.get(String(t.parentTaskId));
      if (parent) {
        if (!parent.data) parent.data = [];
        parent.data.push(node);
      }
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function flatTasks(tasks: GanttTask[]): GanttTask[] {
  const result: GanttTask[] = [];
  function walk(list: GanttTask[]) {
    for (const t of list) {
      result.push(t);
      if (t.data?.length) walk(t.data);
    }
  }
  walk(tasks);
  return result;
}

function taskBarColor(progress: number): string {
  if (progress === 100) return '#16a34a';
  if (progress > 0) return '#2563eb';
  return '#94a3b8';
}

export default function Scheduler({ projectId, onProjectNameChange }: SchedulerProps) {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [flatList, setFlatList] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStart, setNewTaskStart] = useState('');
  const [newTaskEnd, setNewTaskEnd] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const colWidth = COL_WIDTH[viewMode];

  useEffect(() => {
    if (!projectId) return;
    const cancel = { current: false };
    setLoading(true);
    setError(null);

    fetch(`/api/scheduling/tasks?projectId=${projectId}`)
      .then(r => r.json())
      .then(raw => {
        if (cancel.current) return;
        const data: TaskResponse[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
        const tree = buildTree(data);
        setTasks(tree);
        setFlatList(flatTasks(tree));
      })
      .catch(err => { if (!cancel.current) setError(String(err)); })
      .finally(() => { if (!cancel.current) setLoading(false); });

    return () => { cancel.current = true; };
  }, [projectId]);

  const allDates = flatList.flatMap(t => [t.start, t.end]);
  const minDate = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const maxDate = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date();

  // Pad range by ~7 days each side
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);

  const totalDays = Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / 86400000));
  const daysPerCol = DAYS_PER_COL[viewMode];
  const colCount = Math.max(1, Math.ceil(totalDays / daysPerCol));
  const chartWidth = colCount * colWidth;
  const totalHeight = Math.max(400, flatList.length * ROW_HEIGHT + HEADER_HEIGHT + 40);

  function dateToX(date: Date): number {
    const days = (date.getTime() - minDate.getTime()) / 86400000;
    return (days / daysPerCol) * colWidth;
  }

  function dayLabel(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderTimelineHeader(): React.ReactNode {
    const months: { label: string; x: number; width: number; month3: string }[] = [];
    const cur = new Date(minDate);
    cur.setDate(1);
    while (cur <= maxDate) {
      const monthStart = new Date(cur);
      const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
      const x = dateToX(monthStart);
      const end = monthEnd > maxDate ? maxDate : monthEnd;
      const width = dateToX(end) - x;
      months.push({ label: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), x, width: Math.max(width, 30), month3: monthStart.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() });
      cur.setMonth(cur.getMonth() + 1);
    }

    const days: { label: string; x: number }[] = [];
    if (viewMode === 'day') {
      // Day view: one column per day
      const d = new Date(minDate);
      while (d <= maxDate) {
        days.push({ label: String(d.getDate()), x: dateToX(d) });
        d.setDate(d.getDate() + 1);
      }
    } else if (viewMode === 'week') {
      // Week view: one column per 7-day week, label = first day of that week
      const d = new Date(minDate);
      while (d <= maxDate) {
        days.push({ label: String(d.getDate()), x: dateToX(d) });
        d.setDate(d.getDate() + 7);
      }
    } else {
      // Month view: one column per calendar month
      const d = new Date(minDate);
      while (d <= maxDate) {
        days.push({ label: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(), x: dateToX(d) });
        d.setDate(d.getDate() + 30);
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: HEADER_HEIGHT,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', height: 30, borderBottom: '1px solid #e2e8f0', paddingLeft: LABEL_WIDTH }}>
          {months.map((m, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: LABEL_WIDTH + m.x,
                width: m.width,
                fontSize: 11,
                fontWeight: 600,
                color: '#475569',
                paddingLeft: 4,
                lineHeight: '30px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {viewMode === 'month' ? m.label : m.month3}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: 28, paddingLeft: LABEL_WIDTH, overflow: 'hidden' }}>
          {days.map((d, i) => (
            <div
              key={i}
              style={{
              position: 'absolute',
                left: LABEL_WIDTH + d.x,
                width: colWidth,
                textAlign: 'center',
                fontSize: 10,
                color: '#94a3b8',
                lineHeight: '28px',
              }}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderTaskRow(task: GanttTask, depth: number): React.ReactNode {
    const barX = dateToX(task.start);
    const barWidth = Math.max(4, dateToX(task.end) - barX);
    const barTop = 10;
    const barHeight = ROW_HEIGHT - 20;

    return (
      <div
        key={task.id}
        style={{
          height: ROW_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #f1f5f9',
          background: depth % 2 === 0 ? '#fff' : '#fafafa',
          position: 'relative',
        }}
      >
        {/* Task label */}
        <div
          style={{
            width: LABEL_WIDTH,
            paddingLeft: 16 + depth * 20,
            paddingRight: 8,
            fontSize: 13,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {task.data?.length ? (
            <span style={{ color: '#94a3b8', fontSize: 10 }}>▼</span>
          ) : null}
          <span>{task.text}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
            {task.progress > 0 ? `${task.progress}%` : ''}
          </span>
        </div>

        {/* Bar area */}
        <div style={{ position: 'relative', flex: 1, height: ROW_HEIGHT }}>
          {/* Background day lines */}
          {Array.from({ length: colCount }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * colWidth,
                top: 0,
                width: colWidth,
                height: ROW_HEIGHT,
                borderLeft: '1px solid #f1f5f9',
              }}
            />
          ))}

          {/* Today line */}
          <div
            style={{
              position: 'absolute',
              left: dateToX(new Date()),
              top: 0,
              width: 2,
              height: ROW_HEIGHT,
              background: '#ef4444',
              zIndex: 5,
            }}
          />

          {/* Task bar */}
          <div
            title={`${task.text}: ${task.start.toLocaleDateString()} → ${task.end.toLocaleDateString()} (${task.progress}%)`}
            style={{
              position: 'absolute',
              left: barX,
              top: barTop,
              width: barWidth,
              height: barHeight,
              background: taskBarColor(task.progress),
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 6,
              overflow: 'hidden',
              minWidth: 4,
            }}
            onClick={() => handleBarClick(task)}
          >
            {/* Progress fill */}
            {task.progress > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${task.progress}%`,
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: 4,
                }}
              />
            )}
            <span style={{ fontSize: 11, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {task.text}
            </span>
          </div>
        </div>
      </div>
    );
  }

  async function handleBarClick(task: GanttTask) {
    const val = prompt(`Update progress (0-100) for "${task.text}":`, String(task.progress));
    if (val === null) return;
    const pct = parseInt(val);
    if (isNaN(pct) || pct < 0 || pct > 100) return;
    try {
      const res = await fetch(`/api/scheduling/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ percentComplete: pct }),
      });
      if (!res.ok) throw new Error(String(res.status));
      // Refresh
      const r2 = await fetch(`/api/scheduling/tasks?projectId=${projectId}`);
      const raw = await r2.json();
      const data: TaskResponse[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
      const tree = buildTree(data);
      setTasks(tree);
      setFlatList(flatTasks(tree));
    } catch (e) {
      alert('Error updating task: ' + e);
    }
  }

  async function handleAddTask() {
    if (!newTaskName || !newTaskStart || !newTaskEnd) {
      alert('Fill in all fields');
      return;
    }
    try {
      const res = await fetch('/api/scheduling/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(projectId),
          name: newTaskName,
          startDate: new Date(newTaskStart).toISOString(),
          endDate: new Date(newTaskEnd).toISOString(),
          durationDays: Math.ceil((new Date(newTaskEnd).getTime() - new Date(newTaskStart).getTime()) / 86400000),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setNewTaskName('');
      setAddingTask(false);
      // Refresh
      const r2 = await fetch(`/api/scheduling/tasks?projectId=${projectId}`);
      const raw = await r2.json();
      const data: TaskResponse[] = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
      const tree = buildTree(data);
      setTasks(tree);
      setFlatList(flatTasks(tree));
    } catch (e) {
      alert('Error adding task: ' + e);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading tasks...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 500 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e2e8f0', alignItems: 'center', flexWrap: 'wrap' }}>
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

        <div style={{ flex: 1 }} />

        {!addingTask ? (
          <button
            onClick={() => setAddingTask(true)}
            style={{
              padding: '6px 14px',
              fontSize: 13,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + Add Task
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="Task name"
              value={newTaskName}
              onChange={e => setNewTaskName(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4, width: 160 }}
            />
            <input type="date" value={newTaskStart} onChange={e => setNewTaskStart(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>→</span>
            <input type="date" value={newTaskEnd} onChange={e => setNewTaskEnd(e.target.value)}
              style={{ padding: '4px 8px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }} />
            <button onClick={handleAddTask} style={{ padding: '4px 12px', fontSize: 13, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
            <button onClick={() => setAddingTask(false)} style={{ padding: '4px 12px', fontSize: 13, background: '#fff', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
      </div>

      {/* Chart */}
      {flatList.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
          No tasks yet — click "+ Add Task" to get started
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Fixed label column */}
          <div style={{ width: LABEL_WIDTH, flexShrink: 0, overflow: 'hidden', borderRight: '2px solid #e2e8f0' }}>
            {/* Header spacer */}
            <div style={{ height: HEADER_HEIGHT, borderBottom: '2px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'flex-end', padding: '0 16px 4px', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Task Name
            </div>
            {/* Task labels */}
            <div style={{ overflow: 'hidden' }}>
              {flatList.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    height: ROW_HEIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    background: i % 2 === 0 ? '#fff' : '#fafafa',
                    paddingLeft: 16,
                    paddingRight: 8,
                    fontSize: 13,
                    color: '#1e293b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {t.data?.length ? <span style={{ color: '#94a3b8', fontSize: 10, marginRight: 4 }}>▼</span> : null}
                  {t.text}
                </div>
              ))}
            </div>
          </div>

          {/* Scrollable chart area */}
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowX: 'auto', overflowY: 'auto' }}
          >
            <div style={{ width: chartWidth, minHeight: totalHeight, position: 'relative' }}>
              {renderTimelineHeader()}
              <div>
                {flatList.map((t, i) => renderTaskRow(t, 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
