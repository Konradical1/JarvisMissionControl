import { NextResponse } from 'next/server';
import { fetchBridge } from '../../../lib/remote';

export async function POST(request) {
  if (!process.env.JMC_BRIDGE_URL) {
    return NextResponse.json({ ok: false, error: 'Bridge not configured yet.' }, { status: 400 });
  }
  const body = await request.json();
  const result = await fetchBridge('/message', {
    method: 'POST',
    body: JSON.stringify({ message: body.message, deliver: false })
  });
  return NextResponse.json(result);
}
