'use client';

import { useState } from 'react';
import { FamilyMember } from '@/types';

interface FamilyMemberCardProps {
  member: FamilyMember;
  index: number;
  onChange: (index: number, member: FamilyMember) => void;
  onRemove: (index: number) => void;
  removable: boolean;
}

const ROLE_OPTIONS = [
  { label: '业主本人', value: 'self' },
  { label: '配偶', value: 'spouse' },
  { label: '孩子', value: 'child' },
  { label: '父母', value: 'parent' },
  { label: '其他亲属', value: 'other_relative' },
];

const AGE_OPTIONS = [
  { label: '0-6 岁', value: '0_6' },
  { label: '7-17 岁', value: '7_17' },
  { label: '18-35 岁', value: '18_35' },
  { label: '36-55 岁', value: '36_55' },
  { label: '55 岁以上', value: '55+' },
];

const TIME_OPTIONS = [
  { label: '早出晚归', value: 'day_out' },
  { label: '白天也在家', value: 'day_home' },
  { label: '全天在家', value: 'full_day' },
];

const ACTIVITY_OPTIONS = [
  { label: '阅读', value: 'read' },
  { label: '工作/学习', value: 'work' },
  { label: '看电视/影音', value: 'movie' },
  { label: '游戏', value: 'game' },
  { label: '健身/运动', value: 'fitness' },
  { label: '烹饪', value: 'cook' },
  { label: '喝茶/咖啡', value: 'tea' },
  { label: '发呆放松', value: 'relax' },
  { label: '亲子互动', value: 'kids' },
];

export default function FamilyMemberCard({
  member,
  index,
  onChange,
  onRemove,
  removable,
}: FamilyMemberCardProps) {
  const [expanded, setExpanded] = useState(true);

  const update = (field: keyof FamilyMember, value: any) => {
    onChange(index, { ...member, [field]: value });
  };

  const toggleActivity = (val: string) => {
    const current = member.activities || [];
    if (current.includes(val)) {
      update('activities', current.filter((v) => v !== val));
    } else {
      update('activities', [...current, val]);
    }
  };

  return (
    <div className="card mb-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>
          <div className="text-left">
            <span className="font-medium text-sm">
              {member.role ? ROLE_OPTIONS.find((o) => o.value === member.role)?.label : '成员 ' + (index + 1)}
            </span>
            {member.ageGroup && (
              <span className="text-xs text-gray-400 ml-2">
                {AGE_OPTIONS.find((o) => o.value === member.ageGroup)?.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {removable && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              className="text-xs text-red-400 hover:text-red-600"
            >
              删除
            </button>
          )}
          <svg
            className={`w-4 h-4 text-gray-300 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-100">
          {/* 身份 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">身份</label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('role', opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    member.role === opt.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 年龄段 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">年龄段</label>
            <div className="flex flex-wrap gap-2">
              {AGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('ageGroup', opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    member.ageGroup === opt.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 日常状态 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">日常状态</label>
            <input
              type="text"
              value={member.dailyState || ''}
              onChange={(e) => update('dailyState', e.target.value)}
              placeholder="如：上班族、自由职业、退休、学生..."
              className="input-field text-sm"
            />
          </div>

          {/* 在家时间 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">在家时间段</label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update('timeAtHome', opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    member.timeAtHome === opt.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 主要活动 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">主要在家活动（多选）</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map((opt) => {
                const selected = (member.activities || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleActivity(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      selected
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 特殊需求 */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">特殊需求或习惯</label>
            <input
              type="text"
              value={member.specialNeeds || ''}
              onChange={(e) => update('specialNeeds', e.target.value)}
              placeholder="如：无障碍设计、对光线/噪音敏感等..."
              className="input-field text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
