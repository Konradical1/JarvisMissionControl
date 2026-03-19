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
    <form onSubmit={submit} className="mission-form stack compact-stack">
      <textarea className="textarea mission-textarea short" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell Jarvis what to do right now..." />
      <div className="row compact-row align-center">
        <button className="button mission-primary" type="submit">Send command</button>
        <div className="muted mission-status-inline">{status}</div>
      </div>
    </form>
  );
}
