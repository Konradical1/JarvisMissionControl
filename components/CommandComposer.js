'use client';

import { useState } from 'react';

export default function CommandComposer() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('Sending...');
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || 'Failed');
      return;
    }
    setStatus('Sent to Jarvis.');
    setMessage('');
  }

  return (
    <form onSubmit={submit} className="stack">
      <textarea className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell Jarvis what to do..." />
      <div className="row" style={{ alignItems: 'center' }}>
        <button className="button" type="submit">Send to Jarvis</button>
        <div className="muted">{status}</div>
      </div>
    </form>
  );
}
