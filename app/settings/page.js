import { getSettings } from '../../lib/dashboard';

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <div className="stack">
      <div>
        <div className="title">Settings</div>
        <div className="subtitle">Mission control status, connector notes, and room for future custom tools.</div>
      </div>
      <div className="grid cards-2">
        <div className="panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Connector</div>
          <div className="badge medium">{settings.connector?.status || 'unknown'}</div>
          <p className="muted" style={{ marginTop: 12 }}>{settings.connector?.notes}</p>
          <div className="code" style={{ marginTop: 12 }}>Expected env on Vercel:\nJMC_BRIDGE_URL\nJMC_BRIDGE_TOKEN</div>
        </div>
        <div className="panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Planned tool surface</div>
          <ul className="muted">
            <li>Send tasks to Jarvis/OpenClaw from dashboard</li>
            <li>See cron jobs and heartbeat queue</li>
            <li>Per-agent token usage</li>
            <li>Custom mission-control tools</li>
            <li>Password/auth controls</li>
          </ul>
        </div>
      </div>
      <div className="panel">
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Current site password</div>
        <div className="code">{settings.password}</div>
      </div>
    </div>
  );
}
