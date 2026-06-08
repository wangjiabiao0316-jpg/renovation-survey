import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
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

    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/invite/${token}`;

    return NextResponse.json({ client, inviteUrl });
  } catch (err) {
    console.error('Invite error:', err);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
