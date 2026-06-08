'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    // TODO: 对接 Supabase Admin Auth
    // 模拟登录
    setTimeout(() => {
      if (email === 'designer@example.com' && password === 'admin123') {
        setLoading(false);
        router.push('/admin/clients');
      } else {
        setError('邮箱或密码错误');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-800">设计师后台</h1>
          <p className="text-sm text-gray-400 mt-1">管理客户问卷</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>

        <p className="text-xs text-gray-300 text-center mt-6">
          默认账号：designer@example.com / admin123
        </p>
      </div>
    </div>
  );
}
