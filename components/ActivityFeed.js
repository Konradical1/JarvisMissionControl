'use client';

import { useEffect, useState } from 'react';

export default function ActivityFeed({ initialFeed = [] }) {
  const [feed, setFeed] = useState(initialFeed);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const res = await fetch('/api/feed', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setFeed(Array.isArray(data) ? data : []);
      } catch {}
    }

    refresh();
    const id = setInterval(refresh, 2500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="activity-stream">
      {feed.slice(0, 10).map((item) => (
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
  );
}
