'use client';

import { useState, useEffect } from 'react';
import { Gantt } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/all.css';

const dummyTasks = [
  { id: 1, text: 'Project Kickoff', start: new Date('2024-01-01'), end: new Date('2024-01-03'), duration: 3, progress: 100, type: 'milestone', parent: 0, orderId: 0 },
  { id: 2, text: 'Requirements Gathering', start: new Date('2024-01-04'), end: new Date('2024-01-10'), duration: 7, progress: 100, parent: 0, orderId: 1 },
  { id: 3, text: 'Design Phase', start: new Date('2024-01-11'), end: new Date('2024-01-25'), duration: 15, progress: 80, parent: 0, orderId: 2 },
  { id: 4, text: 'Development', start: new Date('2024-01-26'), end: new Date('2024-02-15'), duration: 21, progress: 45, parent: 0, orderId: 3 },
  { id: 5, text: 'Testing', start: new Date('2024-02-16'), end: new Date('2024-02-28'), duration: 12, progress: 0, parent: 0, orderId: 4 },
  { id: 6, text: 'Deployment', start: new Date('2024-03-01'), end: new Date('2024-03-03'), duration: 3, progress: 0, type: 'milestone', parent: 0, orderId: 5 },
];

const dummyLinks = [
  { id: 1, source: 1, target: 2, type: 'e2s' },
  { id: 2, source: 2, target: 3, type: 'e2s' },
  { id: 3, source: 3, target: 4, type: 'e2s' },
  { id: 4, source: 4, target: 5, type: 'e2s' },
  { id: 5, source: 5, target: 6, type: 'e2s' },
];

export default function GanttChart() {
  const [tasks, setTasks] = useState(dummyTasks);
  const [links, setLinks] = useState(dummyLinks);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <h2>🏗️ SVAR Gantt Chart</h2>
      <p>Testing with dummy data...</p>
      <Gantt tasks={tasks} links={links} />
    </div>
  );
}
