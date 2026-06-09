'use client';

import dynamic from 'next/dynamic';

// Loaded without SSR so localStorage reads in useState lazy initializers
// don't produce a hydration mismatch — there is no server HTML to reconcile against.
const QuestionnaireFlow = dynamic(
  () => import('@/components/questionnaire/QuestionnaireFlow'),
  { ssr: false, loading: () => null },
);

export default function QuestionnaireFlowNoSSR() {
  return <QuestionnaireFlow />;
}
