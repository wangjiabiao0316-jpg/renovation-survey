'use client';

import { useRef } from 'react';
import { ImageAttachment } from '@/types';

interface ImageUploadProps {
  images: ImageAttachment[];
  onChange: (images: ImageAttachment[]) => void;
  disabled?: boolean;
}

export default function ImageUpload({ images, onChange, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 将文件转为临时 URL + base64 存储（简化方案，正式用 Supabase Storage）
    const newImages: ImageAttachment[] = [];
    for (const file of Array.from(files)) {
      // 使用 FileReader 读取为 data URL 作为临时预览
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        url: dataUrl,
        description: '',
      });
    }

    onChange([...images, ...newImages]);

    // 清空 input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    onChange(images.filter((img) => img.id !== id));
  };

  const updateDescription = (id: string, desc: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, description: desc } : img)));
  };

  return (
    <div>
      {/* 已上传图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt={img.description || '上传图片'}
                className="w-full aspect-square object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id!)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full
                           flex items-center justify-center text-sm hover:bg-black/80"
              >
                ✕
              </button>
              <input
                type="text"
                disabled={disabled}
                value={img.description}
                onChange={(e) => updateDescription(img.id!, e.target.value)}
                placeholder="添加描述..."
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded outline-none
                           focus:border-gray-400"
              />
            </div>
          ))}
        </div>
      )}

      {/* 上传按钮 */}
      {!disabled && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg
                       flex items-center justify-center text-gray-400 hover:border-gray-500
                       hover:text-gray-600 transition-colors"
          >
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">点击上传图片</span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
