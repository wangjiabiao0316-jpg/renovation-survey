'use client';

import { useState, useRef } from 'react';
import { ImageAttachment } from '@/types';

interface ImageUploadProps {
  images: ImageAttachment[];
  onChange: (images: ImageAttachment[]) => void;
  disabled?: boolean;
  max?: number;
}

export default function ImageUpload({ images, onChange, disabled, max = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = max - images.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (toUpload.length === 0) {
      alert(`最多上传 ${max} 张图片`);
      return;
    }

    // Add local previews first
    const previews: ImageAttachment[] = toUpload.map((f) => ({
      url: URL.createObjectURL(f),
      description: '',
    }));
    onChange([...images, ...previews]);

    // Upload each file
    setUploading(true);
    const uploaded: ImageAttachment[] = [];

    for (const file of toUpload) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'answer');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          uploaded.push({ url: data.url, description: '' });
        } else {
          uploaded.push({ url: URL.createObjectURL(file), description: '' });
        }
      } catch {
        uploaded.push({ url: URL.createObjectURL(file), description: '' });
      }
    }

    setUploading(false);

    // Replace previews with uploaded URLs
    onChange([...images, ...uploaded]);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    const removed = images[index];
    if (removed?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(removed.url);
    }
    onChange(updated);
  };

  const updateDescription = (index: number, desc: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, description: desc } : img)));
  };

  // Clear input so the same file can be selected again
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }

  return (
    <div>
      {/* Image previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <img
                src={img.url}
                alt={img.description || '上传图片'}
                className="w-full aspect-square object-cover rounded-lg border border-gray-200"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full
                             flex items-center justify-center text-sm hover:bg-black/80"
                >
                  ✕
                </button>
              )}
              <input
                type="text"
                disabled={disabled}
                value={img.description}
                onChange={(e) => updateDescription(idx, e.target.value)}
                placeholder="添加描述..."
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded outline-none
                           focus:border-gray-400"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!disabled && images.length < max && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg
                       flex items-center justify-center text-gray-400 hover:border-gray-500
                       hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <div className="text-center">
              <svg className="w-6 h-6 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm">
                {uploading ? '上传中...' : `点击上传图片（最多 ${max} 张）`}
              </span>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
