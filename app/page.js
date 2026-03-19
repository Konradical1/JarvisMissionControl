import { getTasks, getFeed, getAgents, getSettings } from '../lib/dashboard';
import TaskIntake from '../components/TaskIntake';
import CommandComposer from '../components/CommandComposer';
import ActivityFeed from '../components/ActivityFeed';

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

  return (
    <div className="mission-shell">
      <section className="mission-grid-top dashboard-top-grid">
        <div className="mission-panel primary-focus top-board-panel">
          <div className="panel-header-row board-header-tight">
            <div className="board-heading-block">
              <div className="section-cap">Task field</div>
              <h1 className="panel-title-xl board-main-title">Operational board</h1>
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

        <aside className="mission-side-stack top-activity-stack">
          <div className="mission-panel compact-feed top-activity-panel">
            <div className="panel-header-row tight">
              <div>
                <div className="section-cap">Telemetry</div>
                <h2 className="panel-title">Live activity</h2>
              </div>
            </div>
            <ActivityFeed initialFeed={feed} />
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
            <div className="agent-row">
              <div>
                <div className="agent-name">Bridge</div>
                <div className="agent-meta">connector · live status</div>
              </div>
              <div className="agent-state">{settings.connector?.status || 'unknown'}</div>
            </div>
            {agents.slice(0, 3).map((agent) => (
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
