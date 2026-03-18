import { getMemoryBundle } from '../../lib/dashboard';

export default async function MemoryPage() {
  const bundle = await getMemoryBundle();
  return (
    <div className="stack">
      <div>
        <div className="title">Memory</div>
        <div className="subtitle">Editable context sections can live here. Right now this mirrors your current workspace memory files.</div>
      </div>
      <div className="grid cards-3">
        <div className="panel"><div style={{ fontWeight: 700, marginBottom: 10 }}>USER.md</div><div className="code">{bundle.user || 'Missing'}</div></div>
        <div className="panel"><div style={{ fontWeight: 700, marginBottom: 10 }}>MEMORY.md</div><div className="code">{bundle.memory || 'Missing'}</div></div>
        <div className="panel"><div style={{ fontWeight: 700, marginBottom: 10 }}>Today</div><div className="code">{bundle.today || 'Missing'}</div></div>
      </div>
    </div>
  );
}
