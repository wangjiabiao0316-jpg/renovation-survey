'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Answer, SectionKey, FamilyMember, ImageAttachment } from '@/types';
import { SECTION_ORDER, ALL_SECTIONS, getNextSection, getPrevSection, getStepIndex, getTotalSteps } from '@/lib/questions';
import { calculateProgress } from '@/lib/utils';

interface QuestionnaireState {
  // 答案
  answers: Record<string, any>;
  // 家庭成员
  familyMembers: FamilyMember[];
  // 当前 section
  currentSection: SectionKey;
  // 保存状态
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  // 进度
  percentage: number;
  // 是否已提交
  submitted: boolean;
}

interface QuestionnaireContext extends QuestionnaireState {
  setAnswer: (questionKey: string, value: any, section: SectionKey) => void;
  setFamilyMembers: (members: FamilyMember[]) => void;
  goToSection: (section: SectionKey) => void;
  goToNext: () => void;
  goToPrev: () => void;
  submit: () => void;
  getSectionAnswers: (section: SectionKey) => Record<string, any>;
  isCurrentFirst: boolean;
  isCurrentLast: boolean;
  currentStep: number;
  totalSteps: number;
}

const QuestionnaireCtx = createContext<QuestionnaireContext | null>(null);

// 模拟后端：localStorage key
const STORAGE_KEY = 'renovation_survey_answers';
const MEMBERS_KEY = 'renovation_survey_members';

export function QuestionnaireProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuestionnaireState>(() => {
    // 从 localStorage 恢复
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedMembers = localStorage.getItem(MEMBERS_KEY);
        return {
          answers: saved ? JSON.parse(saved) : {},
          familyMembers: savedMembers ? JSON.parse(savedMembers) : [createEmptyMember()],
          currentSection: 'a',
          saveStatus: 'idle',
          percentage: 0,
          submitted: false,
        };
      } catch {}
    }
    return {
      answers: {},
      familyMembers: [createEmptyMember()],
      currentSection: 'a',
      saveStatus: 'idle',
      percentage: 0,
      submitted: false,
    };
  });

  // 计算进度
  useEffect(() => {
    const progress = calculateProgress(
      Object.entries(state.answers).map(([key, value]) => {
        // 找到这个 key 属于哪个 section
        let section: SectionKey = 'a';
        for (const sk of SECTION_ORDER) {
          if (ALL_SECTIONS[sk].questions.some((q) => q.key === key)) {
            section = sk;
            break;
          }
        }
        return {
          questionKey: key,
          section,
          value,
          clientId: '',
        } as Answer;
      })
    );
    setState((prev) => ({ ...prev, percentage: progress.percentage }));
  }, [state.answers]);

  // 自动保存到 localStorage（模拟后端）
  const saveToStorage = useCallback((answers: Record<string, any>, members: FamilyMember[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
    }
  }, []);

  const setAnswer = useCallback(
    (questionKey: string, value: any, section: SectionKey) => {
      setState((prev) => {
        const newAnswers = { ...prev.answers, [questionKey]: value };
        saveToStorage(newAnswers, prev.familyMembers);
        return { ...prev, answers: newAnswers, saveStatus: 'saved' };
      });
    },
    [saveToStorage]
  );

  const setFamilyMembers = useCallback(
    (members: FamilyMember[]) => {
      setState((prev) => {
        saveToStorage(prev.answers, members);
        return { ...prev, familyMembers: members, saveStatus: 'saved' };
      });
    },
    [saveToStorage]
  );

  const goToSection = useCallback((section: SectionKey) => {
    setState((prev) => ({ ...prev, currentSection: section }));
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNext = useCallback(() => {
    const next = getNextSection(state.currentSection);
    if (next) goToSection(next);
  }, [state.currentSection, goToSection]);

  const goToPrev = useCallback(() => {
    const prev = getPrevSection(state.currentSection);
    if (prev) goToSection(prev);
  }, [state.currentSection, goToSection]);

  const submit = useCallback(() => {
    setState((prev) => ({ ...prev, submitted: true }));
  }, []);

  const getSectionAnswers = useCallback(
    (section: SectionKey) => {
      const sectionDef = ALL_SECTIONS[section];
      const result: Record<string, any> = {};
      for (const q of sectionDef.questions) {
        if (state.answers[q.key] !== undefined) {
          result[q.key] = state.answers[q.key];
        }
      }
      return result;
    },
    [state.answers]
  );

  const currentIdx = getStepIndex(state.currentSection);
  const totalSteps = getTotalSteps();

  const context: QuestionnaireContext = {
    ...state,
    setAnswer,
    setFamilyMembers,
    goToSection,
    goToNext,
    goToPrev,
    submit,
    getSectionAnswers,
    isCurrentFirst: currentIdx === 0,
    isCurrentLast: currentIdx === totalSteps - 1,
    currentStep: currentIdx + 1,
    totalSteps,
  };

  return (
    <QuestionnaireCtx.Provider value={context}>
      {children}
    </QuestionnaireCtx.Provider>
  );
}

export function useQuestionnaire() {
  const ctx = useContext(QuestionnaireCtx);
  if (!ctx) throw new Error('useQuestionnaire must be used within QuestionnaireProvider');
  return ctx;
}

function createEmptyMember(): FamilyMember {
  return {
    role: '',
    ageGroup: '',
    dailyState: '',
    timeAtHome: '',
    activities: [],
    specialNeeds: '',
  };
}

export { createEmptyMember };
