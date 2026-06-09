import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // 速率限制：每分钟 10 次（同一管理员）
  const ip = getClientIP(request);
  const rateLimit = checkRateLimit({
    windowSeconds: 60,
    maxAttempts: 10,
    identifier: `invite:${session.designerId}`,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `操作过于频繁，请 ${rateLimit.retryAfter} 秒后重试` },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: '请输入正确的手机号' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Check if phone already exists
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .eq('designer_id', session.designerId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        client: existing,
        token: null, // already registered
        message: '该客户已存在',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        designer_id: session.designerId,
        phone,
        token,
        status: 'invited',
      })
      .select('id, phone, token')
      .single();

    if (error) {
      console.error('Create invitation error:', error);
      return NextResponse.json({ error: '创建失败' }, { status: 500 });
    }

    // 用请求的 Host header 构建链接，适配 localhost / 局域网 IP / 域名多种场景
    const host = request.headers.get('host') || request.nextUrl.host;
    const hostname = host.split(':')[0];
    const isLocal = hostname === 'localhost' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    const baseUrl = `${isLocal ? 'http' : 'https'}://${host}`;
    const inviteUrl = `${baseUrl}/invite/${token}`;

    return NextResponse.json({ client, inviteUrl });
  } catch (err) {
    console.error('Invite error:', err);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
