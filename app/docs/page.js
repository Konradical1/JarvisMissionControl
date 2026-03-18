import Link from 'next/link';
import { getDocs } from '../../lib/dashboard';

export default async function DocsPage({ searchParams }) {
  const params = await searchParams;
  const path = params?.path || '';
  const docs = getDocs(path);

  return (
    <div className="stack">
      <div>
        <div className="title">Docs + Files</div>
        <div className="subtitle">Whole-workspace browser. This is where you can inspect the files Jarvis creates for you.</div>
      </div>
      <div className="grid cards-2">
        <div className="panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Workspace</div>
          <div className="stack">
            {path ? <Link className="badge medium" href="/docs">← root</Link> : null}
            {docs.entries.map((entry) => (
              <Link key={entry.path} href={`/docs?path=${encodeURIComponent(entry.path)}`} className="card">
                <h4>{entry.name}</h4>
                <p>{entry.type} · {entry.path}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Preview</div>
          <div className="code">{docs.content || 'Select a file to preview its contents.'}</div>
        </div>
      </div>
    </div>
  );
}
