'use client';

import { Question, ImageAttachment } from '@/types';
import ImageUpload from './ImageUpload';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (key: string, value: any) => void;
  disabled?: boolean;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
}: QuestionRendererProps) {
  const { key, label, type, options, hint, required, placeholder } = question;

  return (
    <div className="mb-8">
      {/* Question Label */}
      <label className="block mb-3">
        <span className="text-base font-medium text-gray-800">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </span>
      </label>

      {/* Hint */}
      {hint && (
        <p className="text-sm text-gray-400 mb-3 leading-relaxed">{hint}</p>
      )}

      {/* === Radio === */}
      {type === 'radio' && options && (
        <div className="space-y-2.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(key, opt.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all active:scale-[0.99] ${
                value === opt.value
                  ? 'border-gray-800 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-sm">{opt.label}</span>
              {opt.hint && (
                <span className="block text-xs mt-0.5 opacity-60">{opt.hint}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* === Checkbox === */}
      {type === 'checkbox' && options && (
        <div className="space-y-2.5">
          {options.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const arr = Array.isArray(value) ? [...value] : [];
                  if (selected) {
                    onChange(key, arr.filter((v) => v !== opt.value));
                  } else {
                    onChange(key, [...arr, opt.value]);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all active:scale-[0.99] ${
                  selected
                    ? 'border-gray-800 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selected
                        ? 'bg-gray-900 border-gray-900'
                        : 'border-gray-300'
                    }`}
                  >
                    {selected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* === Text === */}
      {type === 'text' && (
        <input
          type="text"
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={placeholder}
          className="input-field"
        />
      )}

      {/* === Textarea === */}
      {type === 'textarea' && (
        <textarea
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(key, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input-field resize-none"
        />
      )}

      {/* === Image === */}
      {type === 'image' && (
        <ImageUpload
          images={Array.isArray(value) ? value : []}
          onChange={(images: ImageAttachment[]) => onChange(key, images)}
          disabled={disabled}
        />
      )}

      {/* === Sort (简化：按顺序数字标记) === */}
      {type === 'sort' && options && (
        <div className="space-y-2">
          {options.map((opt) => {
            const arr: string[] = Array.isArray(value) ? value : [];
            const rank = arr.indexOf(opt.value);
            const selected = rank !== -1;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (selected) {
                    // 移除
                    onChange(key, arr.filter((v) => v !== opt.value));
                  } else {
                    // 添加到末尾
                    onChange(key, [...arr, opt.value]);
                  }
                }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  selected
                    ? 'border-gray-800 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                    selected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {selected ? rank + 1 : '-'}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </div>
              </button>
            );
          })}
          {Array.isArray(value) && value.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              点击调整排序：数字 1 = 最重要，当前已选 {value.length}/{options.length}
            </p>
          )}
        </div>
      )}

      {/* === Number === */}
      {type === 'number' && (
        <input
          type="number"
          disabled={disabled}
          value={typeof value === 'number' ? value : ''}
          onChange={(e) => onChange(key, Number(e.target.value))}
          placeholder={placeholder}
          className="input-field"
        />
      )}
    </div>
  );
}
