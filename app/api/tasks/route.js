import { NextResponse } from 'next/server';
import { readJson, writeJson } from '../../../lib/store';

export async function GET() {
  return NextResponse.json(readJson('tasks.json', []));
}

export async function POST(request) {
  const body = await request.json();
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
