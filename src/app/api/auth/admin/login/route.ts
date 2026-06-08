import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServiceSupabase } from '@/lib/db';
import { setAdminSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
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
