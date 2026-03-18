'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!res.ok) {
      setError('Wrong password.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="login panel">
      <div className="title" style={{ fontSize: 28 }}>Jarvis Mission Control</div>
      <div className="subtitle">Enter the shared password to access the dashboard.</div>
      <form className="stack" onSubmit={handleSubmit} style={{ marginTop: 18 }}>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        {error ? <div style={{ color: '#ff8f8f' }}>{error}</div> : null}
        <button className="button" type="submit">Unlock</button>
      </form>
    </div>
  );
}
