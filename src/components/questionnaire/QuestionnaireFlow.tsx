'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getChildPaths, getVisibleQuestions } from '@/lib/data/questions';
import { QuestionAnswers } from '@/types/question';
import { saveTaxProfile, saveDraft, loadDraft, clearDraft } from '@/lib/storage/local-profile-storage';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { profileToAnswers, answersToProfile } from '@/lib/utils/profile-answers';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';

export default function QuestionnaireFlow() {
  const router = useRouter();

  // useStoredProfile uses useSyncExternalStore with a null server snapshot,
  // so server and client first render both start with null → empty answers.
  // After hydration, the client snapshot loads the real profile from localStorage.
  // This avoids the hydration mismatch from reading localStorage in useState.
  const storedProfile = useStoredProfile();

  // Baseline answers from the stored profile; null profile → empty (server-safe).
  const profileAnswers = useMemo<QuestionAnswers>(() => {
    if (!storedProfile) return {};
    return profileToAnswers(storedProfile);
  }, [storedProfile]);

  // Overrides track only the answers the user sets during this questionnaire session.
  // They are merged on top of profileAnswers so stale profile values don't survive
  // when a parent is toggled to false (the child paths are explicitly set to false).
  // Lazy initializers read localStorage directly on the client; the server always
  // gets the empty defaults (isBrowser() = false → loadDraft() = null).
  // This mirrors the useSyncExternalStore pattern used by useStoredProfile.
  const [overrides, setOverrides] = useState<QuestionAnswers>(() => loadDraft()?.answers ?? {});

  const answers = useMemo<QuestionAnswers>(
    () => ({ ...profileAnswers, ...overrides }),
    [profileAnswers, overrides],
  );

  const [currentIndex, setCurrentIndex] = useState<number>(() => loadDraft()?.currentIndex ?? 0);
  const [liveText, setLiveText] = useState('');
  const questionCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    questionCardRef.current?.focus();
  }, [currentIndex]);

  const visibleQuestions = getVisibleQuestions(answers);
  const total = visibleQuestions.length;
  const current = visibleQuestions[currentIndex];
  const progress = total > 0 ? Math.round((currentIndex / total) * 100) : 0;
  const prevQuestion = currentIndex > 0 ? visibleQuestions[currentIndex - 1] : null;
  const showSectionHeader = !prevQuestion || prevQuestion.sectionLabel !== current?.sectionLabel;

  function answer(value: boolean) {
    const newOverrides: QuestionAnswers = { ...overrides, [current.fieldPath]: value };

    // When the parent is answered false, explicitly set child answers to false in overrides
    // so profile values (e.g. hasStocks=true) don't leak through the merge.
    if (value === false) {
      const childPaths = getChildPaths(current.fieldPath);
      for (const childPath of childPaths) {
        newOverrides[childPath] = false;
      }
    }

    setOverrides(newOverrides);
    setLiveText(value ? 'Sim' : 'Não');
    const newAnswers = { ...profileAnswers, ...newOverrides };
    const newVisible = getVisibleQuestions(newAnswers);
    if (currentIndex + 1 >= newVisible.length) {
      finish(newAnswers);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      saveDraft(newOverrides, nextIndex);
    }
  }

  function goBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  function finish(finalAnswers: QuestionAnswers) {
    clearDraft();
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
          {currentIndex === 0 && (
            <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              Este app organiza suas informações e mostra documentos e alertas para facilitar sua declaração. Ele não envia a declaração para a Receita, não substitui contador e não garante cálculo definitivo de imposto.
            </div>
          )}

          {showSectionHeader && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              {current.sectionLabel}
            </p>
          )}

          <div ref={questionCardRef} tabIndex={-1} className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900 focus:outline-none">
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
