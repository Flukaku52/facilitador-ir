'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChecklistItem, ChecklistCategory } from '@/types/checklist';
import { saveChecklistStateMap } from '@/lib/storage/local-profile-storage';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { useChecklistStore } from '@/lib/hooks/useChecklistStore';
import { generateChecklist, calculateChecklistProgress } from '@/lib/rules/tax-rules';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ProgressBar from '@/components/ui/ProgressBar';
import Toast from '@/components/ui/Toast';
import { ChecklistSkeleton } from '@/components/ui/Skeleton';

const CATEGORY_ORDER: ChecklistCategory[] = [
  'income', 'bank', 'assets', 'investments', 'deductions', 'complex_cases', 'other',
];

type Filter = 'all' | 'pending' | 'done';

export default function ChecklistPage() {
  const profile = useStoredProfile();
  const checklistState = useChecklistStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [toastVisible, setToastVisible] = useState(false);

  const allItems = useMemo<ChecklistItem[]>(() => {
    if (!profile) return [];
    return generateChecklist(profile, profile.taxYear).map((item) => ({
      ...item,
      completed: checklistState[item.id] ?? item.completed,
    }));
  }, [profile, checklistState]);

  const filteredItems = useMemo(() => {
    if (filter === 'pending') return allItems.filter((i) => !i.completed);
    if (filter === 'done') return allItems.filter((i) => i.completed);
    return allItems;
  }, [allItems, filter]);

  function handleToggle(id: string) {
    const newState = { ...checklistState, [id]: !(checklistState[id] ?? false) };
    saveChecklistStateMap(newState);
    setToastVisible((v) => !v); // flip to re-trigger toast each toggle
    setTimeout(() => setToastVisible(false), 10);
    setToastVisible(true);
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Responda o questionário para gerar seu checklist personalizado.
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

  if (allItems.length === 0) return <ChecklistSkeleton />;

  const progress = calculateChecklistProgress(allItems);
  const pendingCount = allItems.filter((i) => i.required && !i.completed).length;
  const doneCount = allItems.filter((i) => i.completed).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Checklist de documentos</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Painel
        </Link>
      </div>

      <ProgressBar value={progress} label="Documentos obrigatórios reunidos" />

      {/* 2.4 — Filters */}
      <div className="flex gap-2">
        {([
          ['all', `Todos (${allItems.length})`],
          ['pending', `Pendentes (${pendingCount})`],
          ['done', `Concluídos (${doneCount})`],
        ] as [Filter, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const group = filteredItems.filter((i) => i.category === cat);
        return <ChecklistGroup key={cat} category={cat} items={group} onToggle={handleToggle} />;
      })}

      {filteredItems.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {filter === 'pending' ? 'Nenhum item pendente.' : filter === 'done' ? 'Nenhum item concluído ainda.' : 'Nenhum item.'}
        </p>
      )}

      <Toast message="Salvo automaticamente" show={toastVisible} />
    </div>
  );
}
