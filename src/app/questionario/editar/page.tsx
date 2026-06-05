'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { QUESTIONS, SECTION_LABELS } from '@/lib/data/questions';
import { Question, QuestionAnswers } from '@/types/question';
import { TaxProfile, createEmptyProfile } from '@/types/tax-profile';
import { classifyComplexity } from '@/lib/rules/tax-rules';
import { saveTaxProfile } from '@/lib/storage/local-profile-storage';
import CorruptedDataToast from '@/components/ui/CorruptedDataToast';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import ErrorFallback from '@/components/layout/ErrorFallback';

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

function getVisibleQuestions(answers: QuestionAnswers): Question[] {
  return QUESTIONS.filter((q) => {
    if (!q.showWhen) return true;
    return answers[q.showWhen.fieldPath] === q.showWhen.equals;
  });
}

export default function EditarRespostasPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <EditarRespostasContent />
    </ErrorBoundary>
  );
}

function EditarRespostasContent() {
  const router = useRouter();
  const profile = useStoredProfile();

  // Only track what the user changes; original values come from profile
  const [overrides, setOverrides] = useState<QuestionAnswers>({});
  const [saved, setSaved] = useState(false);

  // Merge profile answers with user overrides
  const answers = useMemo<QuestionAnswers>(() => {
    if (!profile) return {};
    return { ...profileToAnswers(profile), ...overrides };
  }, [profile, overrides]);

  const visibleQuestions = useMemo(() => getVisibleQuestions(answers), [answers]);

  const sections = useMemo(() => {
    const grouped: Record<string, Question[]> = {};
    for (const q of visibleQuestions) {
      if (!grouped[q.sectionLabel]) grouped[q.sectionLabel] = [];
      grouped[q.sectionLabel].push(q);
    }
    return SECTION_LABELS.filter((s) => grouped[s]).map((s) => ({
      label: s,
      questions: grouped[s],
    }));
  }, [visibleQuestions]);

  function toggle(fieldPath: string, value: boolean) {
    setOverrides((prev) => ({ ...prev, [fieldPath]: value }));
    setSaved(false);
  }

  function handleSave() {
    const newProfile = answersToProfile(answers);
    saveTaxProfile(newProfile);
    setSaved(true);
    setTimeout(() => router.push('/dashboard'), 800);
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Você ainda não concluiu o diagnóstico.
        </p>
        <Link
          href="/questionario"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Começar questionário
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar respostas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Altere suas respostas sem refazer o questionário inteiro.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Painel
        </Link>
      </div>

      <div className="space-y-8">
        {sections.map(({ label, questions }) => (
          <section key={label}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
              {label}
            </h2>
            <div className="space-y-2">
              {questions.map((q) => {
                const current = answers[q.fieldPath];
                return (
                  <div
                    key={q.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                        {q.title}
                      </p>
                      {q.description && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {q.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2 mt-0.5">
                      <button
                        onClick={() => toggle(q.fieldPath, true)}
                        aria-pressed={current === true}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          current === true
                            ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                            : 'border border-gray-300 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => toggle(q.fieldPath, false)}
                        aria-pressed={current === false}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          current === false
                            ? 'bg-gray-700 text-white dark:bg-gray-500'
                            : 'border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 underline dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancelar
        </Link>
        <button
          onClick={handleSave}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {saved ? '✓ Salvo!' : 'Salvar alterações'}
        </button>
      </div>
      <CorruptedDataToast />
    </div>
  );
}
