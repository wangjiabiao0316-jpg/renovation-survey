// ============ 问卷问题定义 ============

export type QuestionType = 'radio' | 'checkbox' | 'text' | 'textarea' | 'image' | 'sort' | 'number' | 'member-card';

export interface QuestionOption {
  label: string;
  value: string;
  hint?: string;
}

export interface Question {
  id: string;
  section: SectionKey;
  key: string;
  label: string;
  type: QuestionType;
  options?: QuestionOption[];
  hint?: string;
  required?: boolean;
  placeholder?: string;
  sortOrder: number;
  // 条件显示
  condition?: {
    dependsOn: string;      // 依赖的问题 key
    value: string | string[]; // 满足条件才显示
  };
}

export type SectionKey = 'a' | 'b' | 'c' | 'd' | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8' | 'e9' | 'e10' | 'e11' | 'f' | 'g' | 'h';

export interface Section {
  key: SectionKey;
  title: string;
  subtitle?: string;
  questions: Question[];
}

// ============ 客户答案 ============

export interface Answer {
  id?: string;
  clientId: string;
  section: SectionKey;
  questionKey: string;
  value: any;
  images?: ImageAttachment[];
  updatedAt?: string;
}

export interface ImageAttachment {
  id?: string;
  url: string;
  description: string;
}

// ============ 客户 ============

export type ClientStatus = 'invited' | 'started' | 'submitted';

export interface Client {
  id: string;
  designerId: string;
  phone: string;
  name?: string;
  status: ClientStatus;
  token: string;
  createdAt: string;
  updatedAt: string;
}

// ============ 家庭成员 ============

export interface FamilyMember {
  id?: string;
  clientId?: string;
  role: string;
  ageGroup: string;
  dailyState: string;
  timeAtHome: string;
  activities: string[];
  specialNeeds: string;
}

// ============ 设计师 ============

export interface Designer {
  id: string;
  email: string;
  name: string;
}

// ============ 步骤进度 ============

export interface StepProgress {
  section: SectionKey;
  completed: boolean;
  questionCount: number;
  answeredCount: number;
}
