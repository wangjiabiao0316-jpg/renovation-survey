'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 发送验证码
  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    setLoading(true);
    // TODO: 对接 Supabase Auth OTP
    // 模拟发送
    setTimeout(() => {
      setCodeSent(true);
      setLoading(false);
      console.log('验证码已发送到', phone);
    }, 1000);
  };

  // 验证并登录
  const verifyCode = async () => {
    if (code.length < 4) {
      alert('请输入验证码');
      return;
    }
    setLoading(true);
    // TODO: 对接 Supabase Auth verify OTP
    // 模拟验证
    setTimeout(() => {
      setLoading(false);
      router.push('/questionnaire');
    }, 800);
  };

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

          {/* 登录表单 */}
          <div className="space-y-4">
            {!codeSent ? (
              <>
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
                <button
                  onClick={sendCode}
                  disabled={loading || phone.length < 11}
                  className="btn-primary w-full"
                >
                  {loading ? '发送中...' : '获取验证码'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    验证码已发送至 {phone.slice(0, 3)}****{phone.slice(7)}
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="请输入 4-6 位验证码"
                    className="input-field text-lg tracking-widest text-center"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <button
                  onClick={verifyCode}
                  disabled={loading || code.length < 4}
                  className="btn-primary w-full"
                >
                  {loading ? '验证中...' : '登录'}
                </button>
                <button
                  onClick={() => { setCodeSent(false); setCode(''); }}
                  className="w-full text-center text-sm text-gray-400 py-2 hover:text-gray-600"
                >
                  更换手机号或重新发送
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-300 pb-8">
        登录即表示同意隐私政策和服务条款
      </p>
    </div>
  );
}
