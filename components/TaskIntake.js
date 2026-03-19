'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskIntake() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', detail: '', priority: 'medium', owner: 'jarvis' });

  async function submit(event) {
    event.preventDefault();
    await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, source: 'dashboard' })
    });
    router.refresh();
    setForm({ title: '', detail: '', priority: 'medium', owner: 'jarvis' });
  }

  return (
    <form onSubmit={submit} className="mission-form stack compact-stack">
      <input className="input mission-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
      <textarea className="textarea mission-textarea" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="Describe the task, constraint, or outcome you want Jarvis to handle." />
      <div className="row compact-row">
        <input className="input mission-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} placeholder="priority" />
        <input className="input mission-input" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="owner" />
      </div>
      <button className="button mission-primary" type="submit">Create task</button>
    </form>
  );
}
