import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const { id } = params;

  // Fetch client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, phone, name, status, token, created_at, updated_at')
    .eq('id', id)
    .eq('designer_id', session.designerId)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: '客户不存在' }, { status: 404 });
  }

  // Fetch answers
  const { data: answers } = await supabase
    .from('client_answers')
    .select('question_key, section, value_json, updated_at')
    .eq('client_id', id);

  // Fetch family members
  const { data: members } = await supabase
    .from('family_members')
    .select('role, age_group, daily_state, time_at_home, activities, special_needs')
    .eq('client_id', id);

  // Convert answers to Record
  const answersMap: Record<string, any> = {};
  if (answers) {
    for (const a of answers) {
      answersMap[a.question_key] = a.value_json;
    }
  }

  return NextResponse.json({
    client,
    answers: answersMap,
    familyMembers: members || [],
  });
}
