import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret-change-me-in-production'
);

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'dev-admin-secret'
);

export interface ClientSession {
  clientId: string;
  phone: string;
}

export interface AdminSession {
  designerId: string;
  email: string;
}

// ── Client JWT ──

export async function signClientToken(payload: ClientSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyClientToken(token: string): Promise<ClientSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as ClientSession;
  } catch {
    return null;
  }
}

// ── Admin JWT ──

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(ADMIN_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

// ── Cookie helpers (server-side, use in API routes) ──

export async function getClientSession(): Promise<ClientSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('client_token')?.value;
  if (!token) return null;
  return verifyClientToken(token);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function setClientSessionCookie(session: ClientSession): Promise<string> {
  const token = await signClientToken(session);
  const cookieStore = await cookies();
  cookieStore.set('client_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function setAdminSessionCookie(session: AdminSession): Promise<string> {
  const token = await signAdminToken(session);
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return token;
}

export async function clearClientSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('client_token');
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}
