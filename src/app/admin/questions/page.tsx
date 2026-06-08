'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_SECTIONS, SECTION_ORDER, SECTION_META } from '@/lib/questions';
import { Question } from '@/types';

export default function QuestionsPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});
  const [customHints, setCustomHints] = useState<Record<string, string>>({});
  const [referenceImages, setReferenceImages] = useState<Record<string, string>>({});

  const handleSave = (question: Question) => {
    // TODO: 保存到 Supabase
    console.log('Saved:', question.id, {
      customLabel: customLabels[question.id],
      customHint: customHints[question.id],
      imageUrl: referenceImages[question.id],
    });
    setEditingQuestion(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/admin/clients')}
            className="text-gray-400 hover:text-gray-600"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-bold text-gray-800">问题管理</h1>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          你可以微调问题文字、添加参考图片。修改后会同步到所有客户的问卷中。
        </p>

        {/* Sections */}
        <div className="space-y-3">
          {SECTION_ORDER.map((sectionKey) => {
            const section = ALL_SECTIONS[sectionKey];
            const meta = SECTION_META[sectionKey];
            if (!section) return null;

            const isExpanded = expandedSection === sectionKey;

            return (
              <div key={sectionKey} className="card">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-gray-800">{meta.title}</h3>
                    <p className="text-xs text-gray-400">
                      {section.questions.length} 个问题
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {section.questions.map((q) => (
                      <div key={q.id} className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate">
                            {customLabels[q.id] || q.label}
                          </p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {q.type}
                            {customLabels[q.id] && ' (已自定义)'}
                            {referenceImages[q.id] && ' · 有参考图'}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap py-1"
                        >
                          编辑
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {editingQuestion && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
               onClick={() => setEditingQuestion(null)}>
            <div
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-gray-800 mb-4">编辑问题</h3>

              <div className="space-y-4">
                {/* 原标题 */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">原标题</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {editingQuestion.label}
                  </p>
                </div>

                {/* 自定义标题 */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">自定义标题（留空使用原文）</label>
                  <input
                    type="text"
                    value={customLabels[editingQuestion.id] || ''}
                    onChange={(e) =>
                      setCustomLabels({ ...customLabels, [editingQuestion.id]: e.target.value })
                    }
                    placeholder={editingQuestion.label}
                    className="input-field text-sm"
                  />
                </div>

                {/* 自定义提示 */}
                {editingQuestion.hint && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">自定义提示（留空使用原文）</label>
                    <textarea
                      value={customHints[editingQuestion.id] || ''}
                      onChange={(e) =>
                        setCustomHints({ ...customHints, [editingQuestion.id]: e.target.value })
                      }
                      placeholder={editingQuestion.hint}
                      className="input-field text-sm"
                      rows={2}
                    />
                  </div>
                )}

                {/* 参考图片 URL */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">参考图片 URL（可选）</label>
                  <input
                    type="text"
                    value={referenceImages[editingQuestion.id] || ''}
                    onChange={(e) =>
                      setReferenceImages({ ...referenceImages, [editingQuestion.id]: e.target.value })
                    }
                    placeholder="https://..."
                    className="input-field text-sm"
                  />
                  {referenceImages[editingQuestion.id] && (
                    <img
                      src={referenceImages[editingQuestion.id]}
                      alt="预览"
                      className="mt-2 w-full h-32 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={() => handleSave(editingQuestion)}
                  className="btn-primary flex-1"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
