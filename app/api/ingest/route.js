import { NextResponse } from 'next/server';
import { readJson, writeJson } from '../../../lib/store';

export async function POST(request) {
  const body = await request.json();
  const tasks = readJson('tasks.json', []);
  const feed = readJson('feed.json', []);

  const task = {
    id: `task-${Date.now()}`,
    title: body.title || 'Untitled task',
    detail: body.detail || 'Created via mission control ingest.',
    status: 'inbox',
    priority: body.priority || 'medium',
    owner: body.owner || 'jarvis',
    source: body.source || 'api',
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  feed.unshift({
    id: `feed-${Date.now()}`,
    time: new Date().toISOString(),
    type: 'task',
    taskId: task.id,
    message: `New task ingested: ${task.title}`
  });

  writeJson('tasks.json', tasks);
  writeJson('feed.json', feed);
  return NextResponse.json({ ok: true, task });
}
