import { NextResponse } from 'next/server';
import { readJson, writeJson } from '../../../lib/store';
import { fetchBridge } from '../../../lib/remote';

export async function GET() {
  if (process.env.JMC_BRIDGE_URL) {
    const snapshot = await fetchBridge('/snapshot', { timeoutMs: 2500 });
    return NextResponse.json(snapshot?.missionControl?.tasks || []);
  }
  return NextResponse.json(readJson('tasks.json', []));
}

export async function POST(request) {
  const body = await request.json();

  if (process.env.JMC_BRIDGE_URL) {
    const result = await fetchBridge('/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 2500
    });
    return NextResponse.json(result.task || result, { status: 201 });
  }

  const tasks = readJson('tasks.json', []);
  const task = {
    id: `task-${Date.now()}`,
    status: 'inbox',
    priority: 'medium',
    owner: 'jarvis',
    source: 'dashboard',
    createdAt: new Date().toISOString(),
    ...body
  };
  tasks.unshift(task);
  writeJson('tasks.json', tasks);
  return NextResponse.json(task, { status: 201 });
}

export async function PATCH(request) {
  const body = await request.json();

  if (process.env.JMC_BRIDGE_URL) {
    const result = await fetchBridge('/tasks', {
      method: 'PATCH',
      body: JSON.stringify(body),
      timeoutMs: 2500
    });
    return NextResponse.json(result);
  }

  const tasks = readJson('tasks.json', []);
  const next = tasks.map((task) => task.id === body.id ? { ...task, ...body, id: task.id } : task);
  writeJson('tasks.json', next);
  return NextResponse.json({ ok: true, tasks: next });
}
