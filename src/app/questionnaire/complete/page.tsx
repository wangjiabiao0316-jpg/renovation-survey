'use client';

import { useRouter } from 'next/navigation';

export default function CompletePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">提交成功！</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          你的需求问卷已成功提交。
          <br />
          设计师会认真阅读你的回答，后续会与你深入沟通。
        </p>
        <p className="text-sm text-gray-400">
          如需修改回答，请联系你的设计师重新开放问卷。
        </p>
      </div>
    </div>
  );
}
