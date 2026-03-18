import { NextResponse } from 'next/server';
import { getMemoryBundle } from '../../../lib/dashboard';

export async function GET() {
  return NextResponse.json(getMemoryBundle());
}
