import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/db';
import { setClientSessionCookie } from '@/lib/auth';
const loginSchema = {
  phone: (v: unknown) => typeof v === 'string' && /^1[3-9]\d{9}$/.test(v as string),
  password: (v: unknown) => typeof v === 'string' && (v as string).length >= 6,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!loginSchema.phone(phone)) {
      return NextResponse.json({ error: '请输入正确的手机号' }, { status: 400 });
    }
    if (!loginSchema.password(password)) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: client, error } = await supabase
      .from('clients')
      .select('id, phone, password_hash, name, status')
      .eq('phone', phone)
      .single();

    if (error || !client) {
      return NextResponse.json({ error: '手机号未注册' }, { status: 401 });
    }

    if (!client.password_hash) {
      return NextResponse.json({ error: '请先通过邀请链接设置密码' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, client.password_hash);
    if (!valid) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    // Update status to started if still invited
    if (client.status === 'invited') {
      await supabase
        .from('clients')
        .update({ status: 'started', updated_at: new Date().toISOString() })
        .eq('id', client.id);
    }

    await setClientSessionCookie({ clientId: client.id, phone: client.phone });

    return NextResponse.json({
      id: client.id,
      phone: client.phone,
      name: client.name,
      status: client.status === 'invited' ? 'started' : client.status,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: '登录失败，请重试' }, { status: 500 });
  }
}
