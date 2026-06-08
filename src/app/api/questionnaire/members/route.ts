import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getClientSession } from '@/lib/auth';

export async function GET() {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  const { data: members, error } = await supabase
    .from('family_members')
    .select('id, role, age_group, daily_state, time_at_home, activities, special_needs')
    .eq('client_id', session.clientId)
    .order('id', { ascending: true });

  if (error) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }

  // Map to frontend field names
  const result = members.map((m) => ({
    id: m.id,
    role: m.role,
    ageGroup: m.age_group,
    dailyState: m.daily_state,
    timeAtHome: m.time_at_home,
    activities: m.activities || [],
    specialNeeds: m.special_needs || '',
  }));

  return NextResponse.json({ members: result });
}

export async function PUT(request: NextRequest) {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { members } = body;

    if (!Array.isArray(members)) {
      return NextResponse.json({ error: '无效数据' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Delete all existing members for this client, then re-insert
    await supabase
      .from('family_members')
      .delete()
      .eq('client_id', session.clientId);

    const rows = members.map((m: any) => ({
      client_id: session.clientId,
      role: m.role || '',
      age_group: m.ageGroup || '',
      daily_state: m.dailyState || '',
      time_at_home: m.timeAtHome || '',
      activities: m.activities || [],
      special_needs: m.specialNeeds || '',
    }));

    const { error } = await supabase
      .from('family_members')
      .insert(rows);

    if (error) {
      console.error('Save members error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save members error:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
