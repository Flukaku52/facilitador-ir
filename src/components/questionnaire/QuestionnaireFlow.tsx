'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS } from '@/lib/data/questions';
import { Question, QuestionAnswers } from '@/types/question';
import { TaxProfile, createEmptyProfile } from '@/types/tax-profile';
import { classifyComplexity } from '@/lib/rules/tax-rules';
import { saveTaxProfile, loadTaxProfile } from '@/lib/storage/local-profile-storage';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

function getVisibleQuestions(answers: QuestionAnswers): Question[] {
  return QUESTIONS.filter((q) => {
    if (!q.showWhen) return true;
    return answers[q.showWhen.fieldPath] === q.showWhen.equals;
  });
}

function profileToAnswers(profile: TaxProfile): QuestionAnswers {
  const answers: QuestionAnswers = {};
  for (const q of QUESTIONS) {
    const value = getNestedValue(profile, q.fieldPath);
    if (typeof value === 'boolean') answers[q.fieldPath] = value;
  }
  return answers;
}

function answersToProfile(answers: QuestionAnswers): TaxProfile {
  const profile = createEmptyProfile();
  for (const [path, value] of Object.entries(answers)) {
    setNestedValue(profile, path, value);
  }
  profile.complexity = classifyComplexity(profile, profile.taxYear);
  profile.updatedAt = new Date().toISOString();
  return profile;
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
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
  const [answers, setAnswers] = useState<QuestionAnswers>(() => {
    // Pre-populate from existing profile so user can edit answers
    if (typeof window !== 'undefined') {
      const existing = loadTaxProfile();
      if (existing) return profileToAnswers(existing);
    }
    return {};
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveText, setLiveText] = useState('');

  const visibleQuestions = getVisibleQuestions(answers);
  const total = visibleQuestions.length;
  const current = visibleQuestions[currentIndex];
  const progress = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
  const prevQuestion = currentIndex > 0 ? visibleQuestions[currentIndex - 1] : null;
  const showSectionHeader = !prevQuestion || prevQuestion.sectionLabel !== current?.sectionLabel;

  function answer(value: boolean) {
    const newAnswers = { ...answers, [current.fieldPath]: value };
    setAnswers(newAnswers);
    setLiveText(value ? 'Sim' : 'Não');
    const newVisible = getVisibleQuestions(newAnswers);
    if (currentIndex + 1 >= newVisible.length) {
      finish(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function finish(finalAnswers: QuestionAnswers) {
    const profile = answersToProfile(finalAnswers);
    saveTaxProfile(profile);
    router.push('/dashboard');
  }

  // 5.1 — Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === 's' || e.key === 'S' || e.key === '1') answer(true);
      if (e.key === 'n' || e.key === 'N' || e.key === '2') answer(false);
      if (e.key === '?' || e.key === '3') answer(false);
      if (e.key === 'ArrowLeft' || e.key === 'Backspace') goBack();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, currentIndex, answers],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!current) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* 5.2 — aria-live for screen readers */}
      <div aria-live="polite" className="sr-only">{liveText}</div>
      <div aria-live="polite" className="sr-only">{current.title}</div>

      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-xl">
          <ProgressBar value={progress} label={`Pergunta ${currentIndex + 1} de ${total}`} />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {showSectionHeader && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              {current.sectionLabel}
            </p>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-900 leading-snug dark:text-gray-100">
              {current.title}
            </h2>
            {current.description && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{current.description}</p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <Button variant="primary" size="lg" fullWidth onClick={() => answer(true)}>
                Sim
                <span className="ml-auto text-xs opacity-60 font-normal hidden sm:inline">[S]</span>
              </Button>
              <Button variant="secondary" size="lg" fullWidth onClick={() => answer(false)}>
                Não
                <span className="ml-auto text-xs opacity-60 font-normal hidden sm:inline">[N]</span>
              </Button>
              <Button variant="ghost" size="lg" fullWidth onClick={() => answer(false)}>
                Não sei / Não se aplica
                <span className="ml-auto text-xs opacity-60 font-normal hidden sm:inline">[?]</span>
              </Button>
            </div>
          </div>

          {currentIndex > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={goBack}
                className="text-sm text-gray-500 hover:text-gray-700 underline dark:text-gray-400 dark:hover:text-gray-300"
              >
                ← Voltar
                <span className="ml-1 text-xs opacity-60 hidden sm:inline">[←]</span>
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600 hidden sm:block">
            Atalhos: <kbd className="font-mono">S</kbd> Sim · <kbd className="font-mono">N</kbd> Não · <kbd className="font-mono">←</kbd> Voltar
          </p>
        </div>
      </div>
    </div>
  );
}
