import { NextResponse } from 'next/server';
import { clearClientSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearClientSessionCookie();
  return NextResponse.json({ success: true });
}
