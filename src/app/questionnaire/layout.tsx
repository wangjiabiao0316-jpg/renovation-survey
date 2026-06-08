'use client';

import { QuestionnaireProvider } from '@/lib/questionnaire-context';

export default function QuestionnaireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QuestionnaireProvider>{children}</QuestionnaireProvider>;
}
