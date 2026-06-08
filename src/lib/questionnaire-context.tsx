'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Answer, SectionKey, FamilyMember } from '@/types';
import { SECTION_ORDER, ALL_SECTIONS, getNextSection, getPrevSection, getStepIndex, getTotalSteps } from '@/lib/questions';
import { calculateProgress } from '@/lib/utils';

interface QuestionnaireState {
  answers: Record<string, any>;
  familyMembers: FamilyMember[];
  currentSection: SectionKey;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  percentage: number;
  submitted: boolean;
  loading: boolean;
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

// Debounced save timer ref — shared across renders
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingAnswers: Record<string, { value: any; section: string }> = {};
let pendingMembers: FamilyMember[] | null = null;

async function flushSaves() {
  const ap = pendingAnswers;
  const mp = pendingMembers;
  pendingAnswers = {};
  pendingMembers = null;

  const promises: Promise<any>[] = [];

  if (Object.keys(ap).length > 0) {
    promises.push(
      fetch('/api/questionnaire/answers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: ap }),
      })
    );
  }

  if (mp !== null) {
    promises.push(
      fetch('/api/questionnaire/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: mp }),
      })
    );
  }

  await Promise.all(promises);
}

function scheduleSave(
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
) {
  if (saveTimer) clearTimeout(saveTimer);
  setSaveStatus('saving');
  saveTimer = setTimeout(async () => {
    try {
      await flushSaves();
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, 2000);
}

export { createEmptyMember };

export function QuestionnaireProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<QuestionnaireState>({
    answers: {},
    familyMembers: [createEmptyMember()],
    currentSection: 'a',
    saveStatus: 'idle',
    percentage: 0,
    submitted: false,
    loading: true,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Load saved data from server on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [answersRes, membersRes] = await Promise.all([
          fetch('/api/questionnaire/answers').then((r) => r.json()).catch(() => ({ answers: {} })),
          fetch('/api/questionnaire/members').then((r) => r.json()).catch(() => ({ members: [] })),
        ]);

        const loadedAnswers = answersRes.answers || {};
        const loadedMembers = membersRes.members?.length
          ? membersRes.members
          : [createEmptyMember()];

        setState((prev) => ({
          ...prev,
          answers: loadedAnswers,
          familyMembers: loadedMembers,
          loading: false,
        }));
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    }

    loadData();
  }, []);

  // Calculate progress
  useEffect(() => {
    const progress = calculateProgress(
      Object.entries(state.answers).map(([key, value]) => {
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

  const setAnswer = useCallback(
    (questionKey: string, value: any, section: SectionKey) => {
      setState((prev) => {
        const newAnswers = { ...prev.answers, [questionKey]: value };
        // Queue for debounced save
        pendingAnswers[questionKey] = { value, section };
        scheduleSave((status) => {
          setState((s) => ({ ...s, saveStatus: status }));
        });
        return { ...prev, answers: newAnswers, saveStatus: 'saving' };
      });
    },
    []
  );

  const setFamilyMembers = useCallback(
    (members: FamilyMember[]) => {
      setState((prev) => {
        pendingMembers = members;
        scheduleSave((status) => {
          setState((s) => ({ ...s, saveStatus: status }));
        });
        return { ...prev, familyMembers: members, saveStatus: 'saving' };
      });
    },
    []
  );

  const goToSection = useCallback((section: SectionKey) => {
    // Flush pending saves immediately on navigation
    flushSaves().catch(() => {});
    setState((prev) => ({ ...prev, currentSection: section }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNext = useCallback(() => {
    const next = getNextSection(stateRef.current.currentSection);
    if (next) goToSection(next);
  }, [goToSection]);

  const goToPrev = useCallback(() => {
    const prev = getPrevSection(stateRef.current.currentSection);
    if (prev) goToSection(prev);
  }, [goToSection]);

  const submit = useCallback(async () => {
    // Flush all pending saves first
    await flushSaves();
    setState((prev) => ({ ...prev, submitted: true }));
    // Redirect to complete page is handled by the section page
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
