import { NextResponse } from 'next/server';
import { readJson, writeJson } from '../../../lib/store';

export async function GET() {
  return NextResponse.json(readJson('feed.json', []));
}

export async function POST(request) {
  const body = await request.json();
  const feed = readJson('feed.json', []);
  const item = {
    id: `feed-${Date.now()}`,
    time: new Date().toISOString(),
    type: 'event',
    ...body
  };
  feed.unshift(item);
  writeJson('feed.json', feed);
  return NextResponse.json(item, { status: 201 });
}
