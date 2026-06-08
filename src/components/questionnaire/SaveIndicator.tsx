'use client';

import { useState, useEffect } from 'react';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
}

export default function SaveIndicator({ status }: SaveIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    switch (status) {
      case 'saving':
        setVisible(true);
        setText('保存中...');
        break;
      case 'saved':
        setVisible(true);
        setText('已保存 ✓');
        const t = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(t);
        break;
      case 'error':
        setVisible(true);
        setText('保存失败，请重试');
        break;
      default:
        break;
    }
  }, [status]);

  if (!visible && status === 'idle') return null;

  return (
    <span
      className={`text-xs transition-opacity duration-300 ${
        status === 'saving'
          ? 'text-gray-400'
          : status === 'saved'
          ? 'text-emerald-600'
          : 'text-red-500'
      }`}
    >
      {text}
    </span>
  );
}

export type { SaveStatus };
