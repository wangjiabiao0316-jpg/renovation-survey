'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SectionKey } from '@/types';
import { SECTION_ORDER, ALL_SECTIONS, SECTION_META, getNextSection, getPrevSection } from '@/lib/questions';
import { useQuestionnaire } from '@/lib/questionnaire-context';
import ProgressBar from '@/components/questionnaire/ProgressBar';
import SaveIndicator from '@/components/questionnaire/SaveIndicator';
import QuestionRenderer from '@/components/questionnaire/QuestionRenderer';
import FamilyMemberCard from '@/components/questionnaire/FamilyMemberCard';

export default function SectionPage() {
  const params = useParams();
  const router = useRouter();
  const sectionKey = params.section as SectionKey;

  const {
    answers,
    familyMembers,
    setAnswer,
    setFamilyMembers,
    percentage,
    saveStatus,
    goToNext,
    goToPrev,
    submit,
    isCurrentFirst,
    isCurrentLast,
  } = useQuestionnaire();

  const sectionDef = ALL_SECTIONS[sectionKey];
  const meta = SECTION_META[sectionKey];

  // 无效 section 重定向
  useEffect(() => {
    if (!sectionDef) {
      router.push('/questionnaire/a');
    }
  }, [sectionDef, router]);

  if (!sectionDef || !meta) return null;

  const isSubmitSection = sectionKey === 'h';
  const prevSection = getPrevSection(sectionKey);
  const nextSection = getNextSection(sectionKey);

  const handleNext = () => {
    if (isSubmitSection) {
      submit();
      router.push('/questionnaire/complete');
    } else if (nextSection) {
      // 检查 E11 是否应该跳过
      if (nextSection === 'e11') {
        const hasPet = answers['has_pet'] === 'yes';
        if (!hasPet) {
          // 跳过宠物空间，去下一个
          const skipNext = getNextSection(nextSection);
          if (skipNext) {
            router.push(`/questionnaire/${skipNext}`);
            return;
          }
        }
      }
      router.push(`/questionnaire/${nextSection}`);
    }
  };

  // 条件过滤问题（E11 无需额外过滤，D section 成员卡片单独处理）
  const visibleQuestions = sectionDef.questions.filter((q) => {
    if (q.condition) {
      const dependValue = answers[q.condition.dependsOn];
      const conditionValue = q.condition.value;
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(dependValue);
      }
      return dependValue === conditionValue;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push('/questionnaire')}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ← 总览
            </button>
            <SaveIndicator status={saveStatus} />
          </div>
          <ProgressBar currentSection={sectionKey} percentage={percentage} />
          <h2 className="text-lg font-bold text-gray-800 mt-3">{meta.title}</h2>
          {meta.subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{meta.subtitle}</p>
          )}
        </div>

        {/* Questions */}
        <div className="px-4 pt-5">
          {sectionKey === 'd' ? (
            // ── D 板块：家庭成员卡片 + 宠物 ──
            <div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-base font-medium text-gray-800">
                    {sectionDef.questions[0].label}
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                </div>
                <p className="text-sm text-gray-400 mb-3">{sectionDef.questions[0].hint}</p>

                {familyMembers.map((member, idx) => (
                  <FamilyMemberCard
                    key={idx}
                    member={member}
                    index={idx}
                    onChange={(i, m) => {
                      const updated = [...familyMembers];
                      updated[i] = m;
                      setFamilyMembers(updated);
                    }}
                    onRemove={(i) => {
                      if (familyMembers.length > 1) {
                        setFamilyMembers(familyMembers.filter((_, j) => j !== i));
                      }
                    }}
                    removable={familyMembers.length > 1}
                  />
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setFamilyMembers([
                      ...familyMembers,
                      { role: '', ageGroup: '', dailyState: '', timeAtHome: '', activities: [], specialNeeds: '' },
                    ])
                  }
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg
                             text-sm text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors"
                >
                  + 添加成员
                </button>
              </div>

              {/* 其余 D 问题（宠物相关） */}
              {sectionDef.questions.slice(1).map((q) => (
                <QuestionRenderer
                  key={q.key}
                  question={q}
                  value={answers[q.key]}
                  onChange={(key, value) => setAnswer(key, value, sectionKey)}
                />
              ))}
            </div>
          ) : (
            // ── 其他板块：标准渲染 ──
            visibleQuestions.map((q) => (
              <QuestionRenderer
                key={q.key}
                question={q}
                value={answers[q.key]}
                onChange={(key, value) => setAnswer(key, value, sectionKey)}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* 上一步 */}
          {!isCurrentFirst && (
            <button
              onClick={() => prevSection && router.push(`/questionnaire/${prevSection}`)}
              className="btn-secondary flex-1"
            >
              上一步
            </button>
          )}

          {/* 下一步 / 提交 */}
          <button onClick={handleNext} className="btn-primary flex-1">
            {isSubmitSection ? '提交问卷' : '下一步'}
          </button>
        </div>

        {/* 保存并退出 */}
        <div className="max-w-lg mx-auto mt-2">
          <button
            onClick={() => router.push('/questionnaire')}
            className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600"
          >
            保存并退出
          </button>
        </div>
      </div>
    </div>
  );
}
