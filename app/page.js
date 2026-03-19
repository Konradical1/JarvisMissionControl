import Link from 'next/link';
import { getTasks, getFeed, getAgents, getSettings } from '../lib/dashboard';
import TaskIntake from '../components/TaskIntake';
import CommandComposer from '../components/CommandComposer';

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

export default async function HomePage() {
  const tasks = await getTasks();
  const feed = await getFeed();
  const agents = await getAgents();
  const settings = await getSettings();
  const grouped = groupTasks(tasks);
  const activeTask = grouped.in_progress[0] || grouped.todo[0] || tasks[0];
  const urgentCount = tasks.filter((task) => task.priority === 'urgent').length;
  const doneCount = grouped.done.length;
  const completion = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <div className="mission-shell">
      <section className="hero-panel mission-panel">
        <div className="hero-grid compact-hero-grid">
          <div className="hero-copy board-hero-copy">
            <div>
              <div className="section-cap">Task field</div>
              <h1 className="hero-title board-hero-title">Operational board</h1>
            </div>

            <div className="hero-meta-row compact-meta-row">
              <div className="signal-chip live"><span className="signal-dot" /> bridge {settings.connector?.status || 'unknown'}</div>
              <div className="signal-chip">agents {agents.length}</div>
              <div className="signal-chip">urgent {urgentCount}</div>
              <div className="signal-chip">completion {completion}%</div>
            </div>

            <div className="hero-actions compact-actions">
              <Link href="/settings" className="button mission-primary">Connector</Link>
              <Link href="/memory" className="button mission-secondary">Memory</Link>
              <Link href="/docs" className="button mission-secondary">Workspace docs</Link>
            </div>
          </div>

          <div className="hero-side">
            <div className="status-rail mission-subpanel">
              <div className="section-cap">Active thread</div>
              <div className="status-block">
                <div className="status-kicker">Primary objective</div>
                <div className="status-title">{activeTask?.title || 'No active objective'}</div>
                <p>{activeTask?.detail || 'No task is currently selected. Use the intake panel to create one.'}</p>
              </div>
              <div className="mini-metrics">
                <div>
                  <span>open</span>
                  <strong>{tasks.length}</strong>
                </div>
                <div>
                  <span>executing</span>
                  <strong>{grouped.in_progress.length}</strong>
                </div>
                <div>
                  <span>resolved</span>
                  <strong>{doneCount}</strong>
                </div>
              </div>
              <div className="progress-arc">
                <div className="progress-bar"><div style={{ width: `${completion}%` }} /></div>
                <div className="progress-caption">mission completion</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-grid-top">
        <div className="mission-panel primary-focus">
          <div className="panel-header-row">
            <div className="board-heading-block">
              <div className="section-cap">Board lanes</div>
              <h2 className="panel-title-xl">Execution flow</h2>
            </div>
            <div className="board-legend">
              {columns.map(([key, label]) => (
                <div key={key} className="legend-pill">{label} <strong>{grouped[key].length}</strong></div>
              ))}
            </div>
          </div>

          <div className="kanban-premium">
            {columns.map(([key, label]) => (
              <div className="kanban-lane" key={key}>
                <div className="lane-head">
                  <span>{label}</span>
                  <strong>{grouped[key].length}</strong>
                </div>
                <div className="lane-stack">
                  {grouped[key].slice(0, 4).map((task) => (
                    <article className="task-tile" key={task.id}>
                      <div className="task-tile-top">
                        <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                        <span className="task-owner">{task.owner}</span>
                      </div>
                      <h3>{task.title}</h3>
                      <p>{task.detail}</p>
                      <div className="task-meta-line">
                        <span>{task.source}</span>
                        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </article>
                  ))}
                  {grouped[key].length === 0 ? <div className="empty-lane">No tasks</div> : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="mission-side-stack">
          <div className="mission-panel compact-feed">
            <div className="panel-header-row tight">
              <div>
                <div className="section-cap">Telemetry</div>
                <h2 className="panel-title">Live activity</h2>
              </div>
            </div>
            <div className="activity-stream">
              {feed.slice(0, 8).map((item) => (
                <div className="activity-item" key={item.id}>
                  <div className="activity-marker" />
                  <div>
                    <div className="activity-topline">
                      <span className="activity-type">{item.type}</span>
                      <time>{new Date(item.time).toLocaleTimeString()}</time>
                    </div>
                    <div className="activity-body">{item.message}</div>
                    {item.taskId ? <div className="activity-tag">{item.taskId}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget-row">
            <div className="mission-panel widget-panel">
              <div className="section-cap">Bridge</div>
              <div className="widget-big">{settings.connector?.status || 'unknown'}</div>
              <p>{settings.connector?.notes || 'No connector note.'}</p>
            </div>
            <div className="mission-panel widget-panel cyan">
              <div className="section-cap">Heartbeat</div>
              <div className="widget-big">Auto</div>
              <p>{settings.heartbeatPolicy}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mission-grid-bottom">
        <div className="mission-panel intake-panel">
          <div className="panel-header-row tight">
            <div>
              <div className="section-cap">Create work</div>
              <h2 className="panel-title">Task intake</h2>
            </div>
          </div>
          <TaskIntake />
        </div>

        <div className="mission-panel command-panel">
          <div className="panel-header-row tight">
            <div>
              <div className="section-cap">Direct command</div>
              <h2 className="panel-title">Message Jarvis</h2>
            </div>
          </div>
          <CommandComposer />
        </div>

        <div className="mission-panel tertiary-panel">
          <div className="panel-header-row tight">
            <div>
              <div className="section-cap">Runtime</div>
              <h2 className="panel-title">Agent surface</h2>
            </div>
          </div>
          <div className="agent-list-premium">
            {agents.slice(0, 4).map((agent) => (
              <div className="agent-row" key={agent.id}>
                <div>
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-meta">{agent.type} · {agent.model}</div>
                </div>
                <div className="agent-state">{agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
