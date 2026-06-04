'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/data/questions';
import { Question, QuestionAnswers } from '@/types/question';
import { TaxProfile, createEmptyProfile } from '@/types/tax-profile';
import { classifyComplexity } from '@/lib/rules/tax-rules';
import { saveTaxProfile } from '@/lib/storage/local-profile-storage';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

function getVisibleQuestions(answers: QuestionAnswers): Question[] {
  return QUESTIONS.filter((q) => {
    if (!q.showWhen) return true;
    return answers[q.showWhen.fieldPath] === q.showWhen.equals;
  });
}

function answersToProfile(answers: QuestionAnswers): TaxProfile {
  const profile = createEmptyProfile();

  for (const [path, value] of Object.entries(answers)) {
    setNestedValue(profile, path, value);
  }

  profile.complexity = classifyComplexity(profile);
  profile.updatedAt = new Date().toISOString();
  return profile;
}

function setNestedValue(obj: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

export default function QuestionnaireFlow() {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleQuestions = getVisibleQuestions(answers);
  const total = visibleQuestions.length;
  const current = visibleQuestions[currentIndex];
  const progress = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  // Group questions by sectionLabel to display section header
  const currentSection = current?.sectionLabel ?? '';
  const prevQuestion = currentIndex > 0 ? visibleQuestions[currentIndex - 1] : null;
  const showSectionHeader = !prevQuestion || prevQuestion.sectionLabel !== currentSection;

  function answer(value: boolean) {
    const newAnswers = { ...answers, [current.fieldPath]: value };
    setAnswers(newAnswers);

    const newVisible = getVisibleQuestions(newAnswers);
    if (currentIndex + 1 >= newVisible.length) {
      finish(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  function finish(finalAnswers: QuestionAnswers) {
    const profile = answersToProfile(finalAnswers);
    saveTaxProfile(profile);
    router.push('/dashboard');
  }

  if (!current) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top progress */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-xl">
          <ProgressBar value={progress} label={`Pergunta ${currentIndex + 1} de ${total}`} />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {showSectionHeader && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-500">
              {currentSection}
            </p>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 leading-snug">
              {current.title}
            </h2>
            {current.description && (
              <p className="mt-2 text-sm text-gray-500">{current.description}</p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => answer(true)}
              >
                Sim
              </Button>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => answer(false)}
              >
                Não
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => answer(false)}
              >
                Não sei / Não se aplica
              </Button>
            </div>
          </div>

          {currentIndex > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={goBack}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                ← Voltar para a pergunta anterior
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
