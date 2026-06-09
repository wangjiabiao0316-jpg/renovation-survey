import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/db';
import { setAdminSessionCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request: NextRequest) {
  // 速率限制：每分钟 5 次
  const ip = getClientIP(request);
  const rateLimit = checkRateLimit({
    windowSeconds: 60,
    maxAttempts: 5,
    identifier: `admin-login:${ip}`,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${rateLimit.retryAfter} 秒后重试` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: designer, error } = await supabase
      .from('designers')
      .select('id, email, password_hash, name')
      .eq('email', email)
      .single();

    if (error || !designer) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, designer.password_hash);
    if (!valid) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    await setAdminSessionCookie({ designerId: designer.id, email: designer.email });

    return NextResponse.json({
      id: designer.id,
      email: designer.email,
      name: designer.name,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ error: '登录失败' }, { status: 500 });
  }
}
