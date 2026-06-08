'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SECTION_ORDER, SECTION_META } from '@/lib/questions';
import { useQuestionnaire } from '@/lib/questionnaire-context';

export default function QuestionnaireHome() {
  const router = useRouter();
  const { currentSection, percentage, submitted, goToSection } = useQuestionnaire();

  // 如果已提交，跳转到完成页
  useEffect(() => {
    if (submitted) {
      router.push('/questionnaire/complete');
    }
  }, [submitted, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">装修需求采集</h1>
          <p className="text-gray-400 text-sm">帮你梳理生活方式，让设计更贴合你的需要</p>
        </div>

        {/* 进度概览 */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">完成进度</span>
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-800 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 步骤列表 */}
        <div className="space-y-1">
          {SECTION_ORDER.map((key) => {
            const meta = SECTION_META[key];
            const isCurrent = key === currentSection;
            return (
              <button
                key={key}
                onClick={() => goToSection(key)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-gray-900 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCurrent ? '●' : '○'}
                  </span>
                  <div>
                    <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>{meta.title}</span>
                    {meta.subtitle && (
                      <span className={`block text-xs mt-0.5 ${isCurrent ? 'text-gray-300' : 'text-gray-400'}`}>
                        {meta.subtitle}
                      </span>
                    )}
                  </div>
                </div>
                {isCurrent && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* 继续按钮 */}
        <div className="mt-8">
          <button
            onClick={() => router.push(`/questionnaire/${currentSection}`)}
            className="btn-primary w-full text-center"
          >
            {percentage > 0 ? '继续填写' : '开始填写'}
          </button>
        </div>
      </div>
    </div>
  );
}
