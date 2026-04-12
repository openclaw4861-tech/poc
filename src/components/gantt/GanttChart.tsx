'use client';

import { useState } from 'react';

export default function GanttChart() {
  const [tasks] = useState([
    { id: 1, text: 'Project Kickoff', start: '2024-01-01', end: '2024-01-03', progress: 100 },
    { id: 2, text: 'Requirements Gathering', start: '2024-01-04', end: '2024-01-10', progress: 100 },
    { id: 3, text: 'Design Phase', start: '2024-01-11', end: '2024-01-25', progress: 80 },
    { id: 4, text: 'Development', start: '2024-01-26', end: '2024-02-15', progress: 45 },
    { id: 5, text: 'Testing', start: '2024-02-16', end: '2024-02-28', progress: 0 },
    { id: 6, text: 'Deployment', start: '2024-03-01', end: '2024-03-03', progress: 0 },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏗️ SVAR Gantt Chart</h2>
      <p>Basic test version</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Task</th>
            <th style={{ padding: '10px' }}>Start</th>
            <th style={{ padding: '10px' }}>End</th>
            <th style={{ padding: '10px' }}>Progress</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{task.text}</td>
              <td style={{ padding: '10px' }}>{task.start}</td>
              <td style={{ padding: '10px' }}>{task.end}</td>
              <td style={{ padding: '10px' }}>{task.progress}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
