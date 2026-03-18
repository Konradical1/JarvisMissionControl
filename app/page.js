import Link from 'next/link';
import { getTasks, getFeed, getAgents, getSettings } from '../lib/dashboard';
import TaskIntake from '../components/TaskIntake';
import CommandComposer from '../components/CommandComposer';

const columns = [
  ['inbox', 'Inbox'],
  ['todo', 'Todo'],
  ['in_progress', 'In Progress'],
  ['waiting', 'Waiting'],
  ['done', 'Done']
];

export default async function HomePage() {
  const tasks = await getTasks();
  const feed = await getFeed();
  const agents = await getAgents();
  const settings = await getSettings();
  const counts = {
    total: tasks.length,
    active: tasks.filter((task) => task.status === 'in_progress').length,
    urgent: tasks.filter((task) => task.priority === 'urgent').length,
    agents: agents.length
  };

  return (
    <div className="stack">
      <div className="topbar">
        <div>
          <div className="title">Tasks</div>
          <div className="subtitle">Main mission control board for Jarvis, your deadlines, and incoming work.</div>
        </div>
        <Link href="/settings" className="button secondary">Connector status</Link>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="label">Open tasks</div><div className="value">{counts.total}</div></div>
        <div className="kpi"><div className="label">In progress</div><div className="value">{counts.active}</div></div>
        <div className="kpi"><div className="label">Urgent</div><div className="value">{counts.urgent}</div></div>
        <div className="kpi"><div className="label">Agents visible</div><div className="value">{counts.agents}</div></div>
      </div>

      <div className="grid cards-2">
        <section className="panel">
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Quick task intake</div>
          <TaskIntake />
        </section>
        <section className="panel">
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Message OpenClaw agent</div>
          <div className="muted" style={{ marginBottom: 12 }}>
            With the bridge configured, this sends a real task/message back into Jarvis on the AWS runtime.
          </div>
          <CommandComposer />
        </section>
      </div>

      <div className="layout-main">
        <section className="panel">
          <div className="topbar" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Kanban board</div>
              <div className="subtitle">Heartbeat rule: {settings.heartbeatPolicy}</div>
            </div>
          </div>
          <div className="kanban">
            {columns.map(([key, label]) => (
              <div className="column" key={key}>
                <h3>{label}</h3>
                {tasks.filter((task) => task.status === key).map((task) => (
                  <div className="card" key={task.id}>
                    <div className={`badge ${task.priority}`}>{task.priority}</div>
                    <h4 style={{ marginTop: 10 }}>{task.title}</h4>
                    <p>{task.detail}</p>
                    <p style={{ marginTop: 10 }}><span className="muted">Owner:</span> {task.owner}</p>
                    <p><span className="muted">Source:</span> {task.source}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="topbar" style={{ marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Live activity feed</div>
              <div className="subtitle">Detailed events for tasks, memory, reminders, and future tool runs.</div>
            </div>
          </div>
          <div className="feed">
            {feed.map((item) => (
              <div className="feedItem" key={item.id}>
                <time>{new Date(item.time).toLocaleString()}</time>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.type}</div>
                <div className="muted">{item.message}</div>
                {item.taskId ? <div style={{ marginTop: 8 }} className="badge medium">{item.taskId}</div> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
