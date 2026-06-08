import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/db';
import { setClientSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: '缺少邀请 token' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Find client by token
    const { data: client, error } = await supabase
      .from('clients')
      .select('id, phone, password_hash, status')
      .eq('token', token)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: '邀请链接无效' }, { status: 404 });
    }

    if (client.password_hash) {
      return NextResponse.json({ error: '该账号已设置过密码，请直接登录' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        password_hash: passwordHash,
        status: 'started',
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (updateError) {
      console.error('Register update error:', updateError);
      return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
    }

    await setClientSessionCookie({ clientId: client.id, phone: client.phone });

    return NextResponse.json({
      id: client.id,
      phone: client.phone,
      status: 'started',
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: '注册失败，请重试' }, { status: 500 });
  }
}
