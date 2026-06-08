import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const supabase = getServiceSupabase();

  const { data: customizations, error } = await supabase
    .from('question_customizations')
    .select('question_id, custom_label, custom_hint, image_url')
    .eq('designer_id', session.designerId);

  if (error) {
    console.error('Fetch customizations error:', error);
    return NextResponse.json({ error: '加载失败' }, { status: 500 });
  }

  // Convert to Record
  const result: Record<string, { custom_label?: string; custom_hint?: string; image_url?: string }> = {};
  for (const c of customizations) {
    result[c.question_id] = {
      custom_label: c.custom_label,
      custom_hint: c.custom_hint,
      image_url: c.image_url,
    };
  }

  return NextResponse.json({ customizations: result });
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question_id, custom_label, custom_hint, image_url } = body;

    if (!question_id) {
      return NextResponse.json({ error: '缺少 question_id' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('question_customizations')
      .upsert({
        question_id,
        designer_id: session.designerId,
        custom_label: custom_label || null,
        custom_hint: custom_hint || null,
        image_url: image_url || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'question_id, designer_id',
      });

    if (error) {
      console.error('Save customization error:', error);
      return NextResponse.json({ error: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save customization error:', err);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
