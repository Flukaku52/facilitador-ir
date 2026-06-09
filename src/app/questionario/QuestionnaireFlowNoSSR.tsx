'use client';

import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import ErrorFallback from '@/components/layout/ErrorFallback';

// Loaded without SSR so localStorage reads in useState lazy initializers
// don't produce a hydration mismatch — there is no server HTML to reconcile against.
const QuestionnaireFlow = dynamic(
  () => import('@/components/questionnaire/QuestionnaireFlow'),
  { ssr: false, loading: () => null },
);

export default function QuestionnaireFlowNoSSR() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <QuestionnaireFlow />
    </ErrorBoundary>
  );
}
