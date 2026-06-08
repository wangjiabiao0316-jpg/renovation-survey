import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db';
import { getClientSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Accept both client and admin uploads
  const supabase = getServiceSupabase();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'answer'; // 'answer' | 'reference'

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG/PNG/WebP 格式' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '图片不能超过 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase
      .storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: '上传失败，请检查 Storage 配置' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl, filename });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
