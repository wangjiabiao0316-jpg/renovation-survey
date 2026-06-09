import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('clients')
    .select('id, phone, name, status, created_at, updated_at')
    .eq('designer_id', session.designerId)
    .order('updated_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: clients, error } = await query;

  if (error) {
    console.error('Fetch clients error:', error);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }

  return NextResponse.json({ clients });
}
