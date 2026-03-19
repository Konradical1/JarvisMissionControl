import { NextResponse } from 'next/server';
import { readJson, writeJson } from '../../../lib/store';
import { fetchBridge } from '../../../lib/remote';

export async function GET() {
  if (process.env.JMC_BRIDGE_URL) {
    const result = await fetchBridge('/feed', { timeoutMs: 2500 });
    return NextResponse.json(result);
  }
  return NextResponse.json(readJson('feed.json', []));
}

export async function POST(request) {
  const body = await request.json();

  if (process.env.JMC_BRIDGE_URL) {
    const result = await fetchBridge('/feed', {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: 2500
    });
    return NextResponse.json(result, { status: 201 });
  }

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
