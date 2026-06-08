'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple fetch wrapper that handles JSON responses
async function api(path: string, body?: Record<string, any>) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  // Check if already logged in
  useEffect(() => {
    api('/api/auth/me').then((data) => {
      if (data.user) {
        router.push('/questionnaire');
      } else {
        setChecking(false);
      }
    }).catch(() => setChecking(false));
  }, [router]);

  const handleLogin = async () => {
    setError('');
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    setLoading(true);

    try {
      const data = await api('/api/auth/client/login', { phone, password });
      if (data.error) {
        setError(data.error);
      } else {
        router.push('/questionnaire');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo / Title */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">装修需求采集</h1>
            <p className="text-sm text-gray-400 mt-2">
              帮助你的设计师更好地了解你的生活
            </p>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号"
                className="input-field text-lg tracking-wide"
                maxLength={11}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="input-field text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || phone.length < 11 || password.length < 6}
              className="btn-primary w-full"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          {/* Hint */}
          <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
            首次使用？请通过设计师发送的邀请链接进入，设置密码后方可登录。
          </p>
        </div>
      </div>
    </div>
  );
}
