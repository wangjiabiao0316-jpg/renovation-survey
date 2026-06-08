'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_SECTIONS, SECTION_ORDER, SECTION_META } from '@/lib/questions';
import { Question } from '@/types';

interface Customizations {
  [questionId: string]: {
    custom_label?: string;
    custom_hint?: string;
    image_url?: string;
  };
}

export default function QuestionsPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [customizations, setCustomizations] = useState<Customizations>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for the editing modal
  const [editLabel, setEditLabel] = useState('');
  const [editHint, setEditHint] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/questions');
        const data = await res.json();
        if (data.customizations) {
          setCustomizations(data.customizations);
        }
      } catch (err) {
        console.error('Failed to load customizations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openEditor = (q: Question) => {
    const cust = customizations[q.id] || {};
    setEditLabel(cust.custom_label || '');
    setEditHint(cust.custom_hint || '');
    setEditImageUrl(cust.image_url || '');
    setEditingQuestion(q);
  };

  const handleSave = async () => {
    if (!editingQuestion) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: editingQuestion.id,
          custom_label: editLabel || null,
          custom_hint: editHint || null,
          image_url: editImageUrl || null,
        }),
      });
      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        // Update local state
        setCustomizations((prev) => ({
          ...prev,
          [editingQuestion.id]: {
            custom_label: editLabel || undefined,
            custom_hint: editHint || undefined,
            image_url: editImageUrl || undefined,
          },
        }));
        setEditingQuestion(null);
      }
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

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
                    {section.questions.map((q) => {
                      const cust = customizations[q.id];
                      return (
                        <div key={q.id} className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 truncate">
                              {cust?.custom_label || q.label}
                            </p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">
                              {q.type}
                              {cust?.custom_label && ' (已自定义)'}
                              {cust?.image_url && ' · 有参考图'}
                            </p>
                          </div>
                          <button
                            onClick={() => openEditor(q)}
                            className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap py-1"
                          >
                            编辑
                          </button>
                        </div>
                      );
                    })}
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
                {/* Original */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">原标题</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {editingQuestion.label}
                  </p>
                </div>

                {/* Custom label */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">自定义标题（留空使用原文）</label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder={editingQuestion.label}
                    className="input-field text-sm"
                  />
                </div>

                {/* Custom hint */}
                {editingQuestion.hint && (
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">自定义提示（留空使用原文）</label>
                    <textarea
                      value={editHint}
                      onChange={(e) => setEditHint(e.target.value)}
                      placeholder={editingQuestion.hint}
                      className="input-field text-sm"
                      rows={2}
                    />
                  </div>
                )}

                {/* Reference image URL */}
                <div>
                  <label className="text-xs text-gray-400 block mb-1">参考图片 URL（可选）</label>
                  <input
                    type="text"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="input-field text-sm"
                  />
                  {editImageUrl && (
                    <img
                      src={editImageUrl}
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
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
