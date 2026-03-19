'use client';

import { useEffect, useMemo, useState } from 'react';

const columns = [
  ['inbox', 'Inbox'],
  ['todo', 'Queued'],
  ['in_progress', 'Executing'],
  ['waiting', 'Waiting'],
  ['done', 'Resolved']
];

function groupTasks(tasks) {
  return Object.fromEntries(columns.map(([key]) => [key, tasks.filter((task) => task.status === key)]));
}

export default function TaskBoard({ initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState(initialTasks[0]?.id || null);
  const [busy, setBusy] = useState(false);
  const grouped = useMemo(() => groupTasks(tasks), [tasks]);
  const selectedTask = tasks.find((task) => task.id === selectedId) || null;

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const res = await fetch('/api/tasks', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted || !Array.isArray(data)) return;
        setTasks(data);
        setSelectedId((current) => {
          if (current && data.some((task) => task.id === current)) return current;
          return data[0]?.id || null;
        });
      } catch {}
    }

    refresh();
    const id = setInterval(refresh, 2500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  async function updateTask(id, patch) {
    setBusy(true);
    const res = await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch })
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.tasks)) {
      setTasks(data.tasks);
      setSelectedId(id);
    }
    setBusy(false);
  }

  return (
    <div className="task-board-shell">
      <div className="kanban-premium interactive-board">
        {columns.map(([key, label]) => (
          <div className="kanban-lane" key={key}>
            <div className="lane-head">
              <span>{label}</span>
              <strong>{grouped[key].length}</strong>
            </div>
            <div className="lane-stack compact-lane-stack">
              {grouped[key].slice(0, 5).map((task) => (
                <button
                  type="button"
                  className={`task-tile compact-task-tile ${selectedId === task.id ? 'selected' : ''}`}
                  key={task.id}
                  onClick={() => setSelectedId(task.id)}
                >
                  <div className="task-tile-top">
                    <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                    <span className="task-owner">{task.owner}</span>
                  </div>
                  <h3 className="truncate-2">{task.title}</h3>
                  <p className="truncate-3">{task.detail}</p>
                  <div className="task-meta-line">
                    <span className="truncate-1">{task.source}</span>
                    <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
              {grouped[key].length === 0 ? <div className="empty-lane">No tasks</div> : null}
            </div>
          </div>
        ))}
      </div>

      <aside className="task-detail-panel mission-panel">
        {selectedTask ? (
          <>
            <div className="panel-header-row tight">
              <div>
                <div className="section-cap">Task detail</div>
                <h2 className="panel-title">{selectedTask.title}</h2>
              </div>
              <span className={`priority-chip ${selectedTask.priority}`}>{selectedTask.priority}</span>
            </div>

            <div className="detail-meta-grid">
              <div>
                <span>Owner</span>
                <strong>{selectedTask.owner}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{selectedTask.status}</strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{selectedTask.source}</strong>
              </div>
              <div>
                <span>Created</span>
                <strong>{new Date(selectedTask.createdAt).toLocaleString()}</strong>
              </div>
            </div>

            <div className="task-detail-copy">{selectedTask.detail || 'No extra detail.'}</div>

            <div className="detail-actions">
              <button className="button mission-primary" disabled={busy} onClick={() => updateTask(selectedTask.id, { status: 'done' })}>Resolve</button>
              <button className="button mission-secondary" disabled={busy} onClick={() => updateTask(selectedTask.id, { status: 'in_progress' })}>Mark executing</button>
              <button className="button mission-secondary" disabled={busy} onClick={() => updateTask(selectedTask.id, { status: 'waiting' })}>Set waiting</button>
            </div>
          </>
        ) : (
          <div className="empty-detail">Select a task to inspect it.</div>
        )}
      </aside>
    </div>
  );
}
