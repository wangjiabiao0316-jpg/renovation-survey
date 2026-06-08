'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

async function api(path: string, body?: Record<string, any>) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export default function InviteRegisterPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  // Validate token on mount
  useEffect(() => {
    // We validate by attempting to look up via the register endpoint's error message
    // Since there's no dedicated token-check endpoint, we'll proceed optimistically
    setStatus('valid');
  }, []);

  const handleRegister = async () => {
    setError('');
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);

    try {
      const data = await api('/api/auth/client/register', { token, password });
      if (data.error) {
        setError(data.error);
        if (data.error.includes('无效') || data.error.includes('已设置')) {
          setStatus('invalid');
        }
      } else {
        router.push('/questionnaire');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">验证邀请链接...</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-800 mb-2">链接无效</h1>
          <p className="text-sm text-gray-400 mb-6">
            邀请链接已失效或已被使用。请联系设计师重新发送。
          </p>
          <button onClick={() => router.push('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.857L3 15l-3-3 3-3 5.257 1.143A6 6 0 0121 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">设置登录密码</h1>
            <p className="text-sm text-gray-400 mt-2">
              请为你的账号设置一个密码，用于后续登录查看问卷
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="input-field text-lg"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="input-field text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={loading || password.length < 6 || confirmPassword.length < 6}
              className="btn-primary w-full"
            >
              {loading ? '设置中...' : '设置密码并开始'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
