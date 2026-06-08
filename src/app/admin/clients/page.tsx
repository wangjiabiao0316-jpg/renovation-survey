'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client, ClientStatus } from '@/types';

// 模拟数据
const MOCK_CLIENTS: Client[] = [
  { id: '1', designerId: 'd1', phone: '138****1234', name: '张先生', status: 'submitted', token: 't1', createdAt: '2026-05-10', updatedAt: '2026-06-01' },
  { id: '2', designerId: 'd1', phone: '139****5678', name: '李女士', status: 'started', token: 't2', createdAt: '2026-06-01', updatedAt: '2026-06-05' },
  { id: '3', designerId: 'd1', phone: '136****9012', name: '王家', status: 'invited', token: 't3', createdAt: '2026-06-08', updatedAt: '2026-06-08' },
];

const STATUS_LABELS: Record<ClientStatus, { label: string; color: string }> = {
  invited: { label: '未开始', color: 'bg-gray-100 text-gray-600' },
  started: { label: '填写中', color: 'bg-amber-100 text-amber-700' },
  submitted: { label: '已提交', color: 'bg-emerald-100 text-emerald-700' },
};

export default function ClientsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all');
  const [clients] = useState<Client[]>(MOCK_CLIENTS);

  const filtered = filter === 'all' ? clients : clients.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-gray-800">客户列表</h1>
          <button
            onClick={() => router.push('/admin/questions')}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            问题管理
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'invited', label: '未开始' },
            { key: 'started', label: '填写中' },
            { key: 'submitted', label: '已提交' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as ClientStatus | 'all')}
              className={`px-3 py-1.5 rounded-full text-xs border whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white border-gray-200 text-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Client Cards */}
        <div className="space-y-3">
          {filtered.map((client) => (
            <button
              key={client.id}
              onClick={() => router.push(`/admin/clients/${client.id}`)}
              className="w-full card text-left hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-800">
                    {client.name || client.phone}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {client.phone} · 更新于 {client.updatedAt}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_LABELS[client.status].color}`}>
                    {STATUS_LABELS[client.status].label}
                  </span>
                  <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">暂无客户</p>
          )}
        </div>

        {/* 邀请链接生成 */}
        <div className="card mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">邀请新客户</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="客户手机号"
              className="input-field flex-1 text-sm"
            />
            <button className="btn-primary text-sm whitespace-nowrap">
              生成链接
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
