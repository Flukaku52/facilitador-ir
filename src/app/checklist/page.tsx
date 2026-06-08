'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChecklistItem, ChecklistCategory, CATEGORY_LABELS } from '@/types/checklist';
import { saveChecklistStateMap } from '@/lib/storage/local-profile-storage';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { useChecklistStore } from '@/lib/hooks/useChecklistStore';
import { generateChecklist, calculateChecklistProgress } from '@/lib/rules/tax-rules';
import {
  applyChecklistFilters,
  getAvailableCategories,
  CHECKLIST_CATEGORY_ORDER,
  StatusFilter,
} from '@/lib/rules/checklist-filter';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ProgressBar from '@/components/ui/ProgressBar';
import Toast from '@/components/ui/Toast';
import CorruptedDataToast from '@/components/ui/CorruptedDataToast';
import { ChecklistSkeleton } from '@/components/ui/Skeleton';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import ErrorFallback from '@/components/layout/ErrorFallback';

export default function ChecklistPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ChecklistContent />
    </ErrorBoundary>
  );
}

function ChecklistContent() {
  const profile = useStoredProfile();
  const checklistState = useChecklistStore();

  // ── filter state ──────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ChecklistCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── data ──────────────────────────────────────────────────────────────────
  const allItems = useMemo<ChecklistItem[]>(() => {
    if (!profile) return [];
    return generateChecklist(profile, profile.taxYear).map((item) => ({
      ...item,
      completed: checklistState[item.id] ?? item.completed,
    }));
  }, [profile, checklistState]);

  const filteredItems = useMemo(
    () =>
      applyChecklistFilters(allItems, {
        status: statusFilter,
        category: categoryFilter,
        query: searchQuery,
      }),
    [allItems, statusFilter, categoryFilter, searchQuery],
  );

  // Categories derived from allItems so pills don't change as the user types
  const availableCategories = useMemo(() => getAvailableCategories(allItems), [allItems]);

  // ── counters always reflect the full list, not the filtered view ──────────
  const progress = calculateChecklistProgress(allItems);
  const pendingCount = allItems.filter((i) => !i.completed).length;
  const doneCount = allItems.filter((i) => i.completed).length;
  const hasActiveFilter =
    statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery.trim() !== '';

  // ── handlers ──────────────────────────────────────────────────────────────
  function handleToggle(id: string) {
    const newState = { ...checklistState, [id]: !(checklistState[id] ?? false) };
    saveChecklistStateMap(newState);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }

  // ── empty / loading states ────────────────────────────────────────────────
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

  // ── empty message when filters produce zero results ───────────────────────
  const emptyMessage = searchQuery.trim()
    ? `Nenhum documento encontrado para "${searchQuery.trim()}".`
    : statusFilter === 'pending'
    ? 'Nenhum item pendente com os filtros selecionados.'
    : statusFilter === 'done'
    ? 'Nenhum item concluído com os filtros selecionados.'
    : 'Nenhum item encontrado com os filtros selecionados.';

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Checklist de documentos</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Painel
        </Link>
      </div>

      {/* Progress — always reflects full list */}
      <ProgressBar value={progress} label="Documentos obrigatórios reunidos" />

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-600 dark:focus:border-indigo-500"
          aria-label="Buscar documentos"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
            aria-label="Limpar busca"
          >
            ×
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            ['all', `Todos (${allItems.length})`],
            ['pending', `Pendentes (${pendingCount})`],
            ['done', `Concluídos (${doneCount})`],
          ] as [StatusFilter, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category filter pills — shown only when 2+ categories are available */}
      {availableCategories.length >= 2 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-gray-700 text-white dark:bg-gray-400 dark:text-gray-900'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
            }`}
          >
            Todas as categorias
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-gray-700 text-white dark:bg-gray-400 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* "Exibindo X de Y" indicator — shown only when any filter is active */}
      {hasActiveFilter && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Exibindo {filteredItems.length} de {allItems.length} itens
        </p>
      )}

      {/* Checklist groups */}
      {CHECKLIST_CATEGORY_ORDER.map((cat) => {
        const group = filteredItems.filter((i) => i.category === cat);
        return <ChecklistGroup key={cat} category={cat} items={group} onToggle={handleToggle} />;
      })}

      {/* Empty state when filters yield no results */}
      {filteredItems.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">{emptyMessage}</p>
      )}

      <Toast message="Salvo automaticamente" show={toastVisible} />
      <CorruptedDataToast />
    </div>
  );
}
