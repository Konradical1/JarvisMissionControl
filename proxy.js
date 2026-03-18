import { NextResponse } from 'next/server';

const openRoutes = ['/login', '/api/auth'];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  if (openRoutes.some((route) => pathname.startsWith(route)) || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get('jarvis-mission-control')?.value;
  if (!cookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/feed|api/tasks|api/docs|api/memory).*)']
};
