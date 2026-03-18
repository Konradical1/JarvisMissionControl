import { getAgents } from '../../lib/dashboard';

export default async function AgentsPage() {
  const agents = await getAgents();
  return (
    <div className="stack">
      <div>
        <div className="title">Agents</div>
        <div className="subtitle">Usage, subagent visibility, and a home for future live OpenClaw runtime data.</div>
      </div>
      <div className="grid cards-2">
        {agents.map((agent) => (
          <div className="panel" key={agent.id}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{agent.name}</div>
                <div className="subtitle">{agent.type} · {agent.model}</div>
              </div>
              <div className="badge medium">{agent.status}</div>
            </div>
            <table className="table" style={{ marginTop: 16 }}>
              <tbody>
                <tr><th>Usage window</th><td>{agent.usage.window}</td></tr>
                <tr><th>Quota left</th><td>{agent.usage.left}</td></tr>
                <tr><th>Cache</th><td>{agent.usage.cached}</td></tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="panel">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Planned v2 integration</div>
        <div className="muted">This page is structured for per-subagent tokens, active sessions, live tasks, cron jobs, and command dispatch once the secure AWS/OpenClaw bridge is wired.</div>
      </div>
    </div>
  );
}
