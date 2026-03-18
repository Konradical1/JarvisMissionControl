import { NextResponse } from 'next/server';
import { getSettings } from '../../../lib/dashboard';

export async function POST(request) {
  const body = await request.json();
  const settings = getSettings();
  if (body.password === settings.password) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set('jarvis-mission-control', settings.password, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/'
    });
    return response;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
