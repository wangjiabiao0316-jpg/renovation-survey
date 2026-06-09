'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientStatus } from '@/types';

interface Client {
  id: string;
  phone: string;
  name: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<ClientStatus, { label: string; color: string }> = {
  invited: { label: '未开始', color: 'bg-gray-100 text-gray-600' },
  started: { label: '填写中', color: 'bg-amber-100 text-amber-700' },
  submitted: { label: '已提交', color: 'bg-emerald-100 text-emerald-700' },
};

export default function ClientsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      const res = await fetch(`/api/admin/clients${filter !== 'all' ? `?status=${filter}` : ''}`);
      const data = await res.json();
      if (data.clients) setClients(data.clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadClients();
  }, [filter]);

  const handleInvite = async () => {
    if (!/^1[3-9]\d{9}$/.test(invitePhone)) {
      alert('请输入正确的手机号');
      return;
    }
    setInviting(true);
    setInviteResult(null);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: invitePhone }),
      });
      const data = await res.json();

      if (data.inviteUrl) {
        setInviteResult(data.inviteUrl);
        loadClients(); // Refresh list
      } else if (data.message) {
        setInviteResult(data.message);
      } else {
        setInviteResult(data.error || '创建失败');
      }
    } catch {
      setInviteResult('网络错误');
    } finally {
      setInviting(false);
    }
  };

  const filtered = clients.filter((c) => filter === 'all' || c.status === filter);

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
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">加载中...</p>
        ) : (
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
                      {client.phone} · 更新于 {client.updated_at?.slice(0, 10)}
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
        )}

        {/* Invite */}
        <div className="card mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">邀请新客户</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={invitePhone}
              onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="客户手机号"
              className="input-field flex-1 text-sm"
              maxLength={11}
            />
            <button
              onClick={handleInvite}
              disabled={inviting || invitePhone.length < 11}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {inviting ? '生成中...' : '生成链接'}
            </button>
          </div>

          {inviteResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              {inviteResult.startsWith('http') ? (
                <>
                  <p className="text-xs text-gray-500 mb-2">邀请链接（微信发送给客户）：</p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={inviteResult}
                      className="input-field flex-1 text-xs"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inviteResult);
                        alert('已复制到剪贴板');
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap"
                    >
                      复制
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-500">{inviteResult}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
