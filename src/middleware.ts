import { NextRequest, NextResponse } from 'next/server';

// Paths that don't require auth
const PUBLIC_PATHS = ['/', '/invite'];
const ADMIN_LOGIN_PATH = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Static assets ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // ── Admin routes (except login page) ──
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // ── Questionnaire routes ──
  if (pathname.startsWith('/questionnaire')) {
    const clientToken = request.cookies.get('client_token')?.value;
    if (!clientToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // ── Invite routes are public ──
  if (pathname.startsWith('/invite')) {
    return NextResponse.next();
  }

  // ── Root: redirect to questionnaire if already logged in as client ──
  if (pathname === '/') {
    const clientToken = request.cookies.get('client_token')?.value;
    if (clientToken) {
      return NextResponse.redirect(new URL('/questionnaire', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
