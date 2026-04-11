'use client';

import { useEffect, useState } from 'react';
import ProjectScheduler from '@/components/scheduling/Scheduler';

export default function SchedulerPage() {
  const [projectList, setProjectList] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/scheduling/projects');
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }
        const data = await response.json();
        if (cancelled) return;
        setProjectList(data.data || []);
        // Select first project by default if none selected
        if (!selectedProjectId && data.data?.[0]?.id) {
          setSelectedProjectId(String(data.data[0].id));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setProjectList([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProjects();
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  const handleCreateProject = async () => {
    const name = prompt('Enter project name:');
    if (!name) return;
    try {
      const response = await fetch('/api/scheduling/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create project: ${response.status}`);
      }
      const data = await response.json();
      const newProject = Array.isArray(data.data) ? { id: data.data[data.data.length-1].id, name } : { id: data.data.id, name };
      setProjectList([...projectList, newProject]);
      setSelectedProjectId(String(data.data.id));
    } catch (err) {
      alert('Error creating project: ' + err);
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Project Scheduler</h1>
        <button onClick={handleCreateProject}>New Project</button>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Project List */}
        <div style={{ width: '250px', border: '1px solid #ddd', padding: '10px' }}>
          <h2>Projects</h2>
          <ul>
            {projectList.map(p => (
              <li
                key={p.id}
                onClick={() => setSelectedProjectId(String(p.id))}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedProjectId === String(p.id) ? '#f0f0f0' : 'white',
                  border: selectedProjectId === String(p.id) ? '2px solid #007bff' : 'none',
                }}
              >
                {p.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Scheduler */}
        <div style={{ flex: 1 }}>
          {selectedProjectId ? (
            <ProjectScheduler projectId={selectedProjectId} />
          ) : (
            <div>Select a project to view its schedule</div>
          )}
        </div>
      </div>
    </div>
  );
}