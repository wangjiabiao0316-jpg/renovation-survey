import { SectionKey, Answer, StepProgress } from '@/types';
import { SECTION_ORDER, ALL_SECTIONS } from './questions';

/**
 * 生成唯一 token（用于客户邀请链接）
 */
export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

/**
 * 计算问卷完成进度
 */
export function calculateProgress(answers: Answer[]): {
  percentage: number;
  steps: StepProgress[];
} {
  const steps: StepProgress[] = SECTION_ORDER.map((section) => {
    const sectionDef = ALL_SECTIONS[section];
    const questionKeys = sectionDef.questions.map((q) => q.key);
    const answeredKeys = answers
      .filter((a) => a.section === section && a.value !== null && a.value !== '')
      .map((a) => a.questionKey);
    const questionCount = questionKeys.length;
    const answeredCount = answeredKeys.length;
    return {
      section,
      completed: answeredCount >= questionCount,
      questionCount,
      answeredCount,
    };
  });

  const totalQuestions = steps.reduce((s, st) => s + st.questionCount, 0);
  const totalAnswered = steps.reduce((s, st) => s + st.answeredCount, 0);
  const percentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return { percentage, steps };
}

/**
 * 获取下一个未完成的 section
 */
export function getNextIncompleteSection(
  answers: Answer[],
  currentSection: SectionKey
): SectionKey | null {
  const progress = calculateProgress(answers);
  const currentIdx = SECTION_ORDER.indexOf(currentSection);

  // 先往后找
  for (let i = currentIdx + 1; i < SECTION_ORDER.length; i++) {
    if (!progress.steps[i].completed) return SECTION_ORDER[i];
  }
  // 如果后面都完成了，从头找
  for (let i = 0; i < currentIdx; i++) {
    if (!progress.steps[i].completed) return SECTION_ORDER[i];
  }
  return null;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 格式化手机号（隐藏中间 4 位）
 */
export function maskPhone(phone: string): string {
  if (phone.length < 11) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(7);
}
