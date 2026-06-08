'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SECTION_ORDER, SECTION_META, ALL_SECTIONS } from '@/lib/questions';

interface ClientDetail {
  client: {
    id: string;
    phone: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  answers: Record<string, any>;
  familyMembers: Array<{
    role: string;
    age_group: string;
    daily_state: string;
    time_at_home: string;
    activities: string[];
    special_needs: string;
  }>;
}

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/clients/${id}`);
        const result = await res.json();
        if (result.error) {
          setError(result.error);
        } else {
          setData(result);
        }
      } catch {
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const getAnswerDisplay = (sectionKey: string, questionKey: string) => {
    const value = data?.answers?.[questionKey];
    if (value === undefined || value === null) return <span className="text-gray-300 text-sm">未填写</span>;

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((v, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
              {String(v)}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(value)}</p>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">{error || '客户不存在'}</p>
          <button onClick={() => router.push('/admin/clients')} className="text-sm text-gray-500 hover:text-gray-700">
            ← 返回列表
          </button>
        </div>
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
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {data.client.name || data.client.phone} · 问卷详情
            </h1>
            <p className="text-xs text-gray-400">
              {data.client.status === 'submitted' ? '已提交' : '填写中'} · {data.client.updated_at?.slice(0, 10)}
            </p>
          </div>
        </div>

        {/* Family Members (if any) */}
        {data.familyMembers.length > 0 && data.familyMembers[0].role && (
          <div className="card mb-4">
            <h3 className="font-medium text-sm text-gray-800 mb-3">家庭成员</h3>
            <div className="space-y-2">
              {data.familyMembers.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">
                    {m.role} · {m.age_group} · {m.time_at_home}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answers by section */}
        <div className="space-y-4">
          {SECTION_ORDER.map((sectionKey) => {
            const meta = SECTION_META[sectionKey];
            const sectionDef = ALL_SECTIONS[sectionKey];
            if (!sectionDef) return null;

            return (
              <div key={sectionKey} className="card">
                <h3 className="font-medium text-sm text-gray-800 mb-3">
                  {meta.title}
                </h3>
                <div className="space-y-3">
                  {sectionDef.questions.map((q) => (
                    <div key={q.key}>
                      <label className="text-xs text-gray-400 block mb-1">
                        {q.label}
                      </label>
                      {getAnswerDisplay(sectionKey, q.key)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Export button */}
        <div className="mt-8 mb-4">
          <button className="btn-secondary w-full" onClick={() => window.print()}>
            导出 PDF（打印）
          </button>
        </div>
      </div>
    </div>
  );
}
