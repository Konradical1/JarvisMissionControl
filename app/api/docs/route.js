import { NextResponse } from 'next/server';
import { getDocs } from '../../../lib/dashboard';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '';
  return NextResponse.json(getDocs(path));
}
