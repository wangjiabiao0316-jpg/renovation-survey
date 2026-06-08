'use client';

import { SectionKey } from '@/types';
import { getStepIndex, getTotalSteps } from '@/lib/questions';

interface ProgressBarProps {
  currentSection: SectionKey;
  percentage: number;
}

export default function ProgressBar({ currentSection, percentage }: ProgressBarProps) {
  const current = getStepIndex(currentSection) + 1;
  const total = getTotalSteps();

  return (
    <div className="w-full">
      {/* 百分比 + 步骤文字 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          第 {current} / {total} 步
        </span>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
      {/* 进度条 */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
