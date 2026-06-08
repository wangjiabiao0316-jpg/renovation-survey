import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getClientSession } from '@/lib/auth';

export async function GET() {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  const { data: answers, error } = await supabase
    .from('client_answers')
    .select('question_key, section, value_json, updated_at')
    .eq('client_id', session.clientId);

  if (error) {
    console.error('Fetch answers error:', error);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }

  // Convert to Record<string, any> for frontend
  const result: Record<string, any> = {};
  for (const row of answers) {
    result[row.question_key] = row.value_json;
  }

  return NextResponse.json({ answers: result });
}

export async function PUT(request: NextRequest) {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { answers } = body; // Record<string, { value: any; section: string }>

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: '无效数据' }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const now = new Date().toISOString();

    // Upsert each answer
    const rows = Object.entries(answers).map(([questionKey, entry]: [string, any]) => ({
      client_id: session.clientId,
      question_key: questionKey,
      section: entry.section || '',
      value_json: entry.value ?? entry,
      updated_at: now,
    }));

    const { error } = await supabase
      .from('client_answers')
      .upsert(rows, {
        onConflict: 'client_id, question_key',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Save answers error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    // Mark client as started if not already
    await supabase
      .from('clients')
      .update({ status: 'started', updated_at: now })
      .eq('id', session.clientId)
      .eq('status', 'invited');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save answers error:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
