'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChecklistItem, ChecklistCategory, CATEGORY_LABELS } from '@/types/checklist';
import { clearDraft, saveChecklistStateMap, saveChecklistNote } from '@/lib/storage/local-profile-storage';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { useChecklistStore } from '@/lib/hooks/useChecklistStore';
import { useChecklistNotes } from '@/lib/hooks/useChecklistNotes';
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
 const router = useRouter();
 const profile = useStoredProfile();
 const checklistState = useChecklistStore();
 const notes = useChecklistNotes();

 const handleRestartQuestionnaire = useCallback(() => {
 clearDraft();
 router.push('/questionario');
 }, [router]);

 const handleNoteChange = useCallback((id: string, note: string) => {
 saveChecklistNote(id, note);
 }, []);

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
 // Defer toast to a macrotask so it runs after React's SyncLane microtask
 // (triggered by the synchronous StorageEvent dispatch inside saveChecklistStateMap)
 // finishes. Without this, the toast setState can get lost in the same SyncLane
 // batch and never commit to the DOM in production React 18 concurrent mode.
 setTimeout(() => {
 if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
 setToastVisible(true);
 toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
 }, 0);
 }

 // ── empty / loading states ────────────────────────────────────────────────
 if (!profile) {
 return (
 <div className="mx-auto max-w-xl px-4 py-20 text-center">
 <p className="text-lg text-body">
 Responda o questionário para gerar seu checklist personalizado.
 </p>
 <Link
 href="/questionario"
 className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Começar questionário
 </Link>
 </div>
 );
 }

 if (allItems.length === 0) {
 return (
 <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
 <p className="text-lg text-body">
 Nenhum documento principal foi identificado com as respostas atuais.
 </p>
 <p className="text-sm text-muted">
 Se suas informações mudaram, você pode revisar suas respostas.
 </p>
 <div className="flex flex-col items-center gap-3 pt-2">
 <Link
 href="/questionario/editar"
 className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-white font-semibold hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Editar respostas
 </Link>
 <Link
 href="/relatorio"
 className="text-sm text-primary-600 hover:underline dark:text-primary-400"
 >
 Ver relatório
 </Link>
 <button
 onClick={handleRestartQuestionnaire}
 className="text-sm text-muted hover:underline"
 >
 Refazer questionário
 </button>
 </div>
 </div>
 );
 }

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
 <h1 className="text-2xl font-bold text-foreground">Checklist de documentos</h1>
 <Link href="/dashboard" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
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
 className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground placeholder-muted focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 dark:placeholder-muted dark:focus:border-primary-500"
 aria-label="Buscar documentos"
 />
 {searchQuery && (
 <button
 onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body dark:hover:text-body text-lg leading-none"
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
 ? 'bg-primary-600 text-white dark:bg-primary-500'
 : 'bg-slate-100 text-body hover:bg-slate-200 dark:bg-slate-800 dark:text-muted dark:hover:bg-slate-700'
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
 ? 'bg-slate-700 text-white dark:bg-slate-400 dark:text-slate-900'
 : 'bg-slate-100 text-muted hover:bg-slate-200 dark:bg-slate-800 dark:text-muted dark:hover:bg-slate-700'
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
 ? 'bg-slate-700 text-white dark:bg-slate-400 dark:text-slate-900'
 : 'bg-slate-100 text-muted hover:bg-slate-200 dark:bg-slate-800 dark:text-muted dark:hover:bg-slate-700'
 }`}
 >
 {CATEGORY_LABELS[cat]}
 </button>
 ))}
 </div>
 )}

 {/* "Exibindo X de Y" indicator — shown only when any filter is active */}
 {hasActiveFilter && (
 <p className="text-xs text-muted">
 Exibindo {filteredItems.length} de {allItems.length} itens
 </p>
 )}

 {/* Checklist groups */}
 {CHECKLIST_CATEGORY_ORDER.map((cat) => {
 const group = filteredItems.filter((i) => i.category === cat);
 return <ChecklistGroup key={cat} category={cat} items={group} notes={notes} onToggle={handleToggle} onNoteChange={handleNoteChange} />;
 })}

 {/* Empty state when filters yield no results */}
 {filteredItems.length === 0 && (
 <p className="text-muted text-center py-8">{emptyMessage}</p>
 )}

 {/* Completion banner — shown only when all required items are checked */}
 {progress === 100 && allItems.length > 0 && (
 <div className="rounded-xl border border-success-200 bg-success-50 p-6 dark:border-success-900 dark:bg-success-950">
 <h2 className="font-semibold text-success-900 mb-2 dark:text-success-100">
 Checklist completo!
 </h2>
 <p className="text-sm text-success-800 dark:text-success-200 mb-4">
 Todos os documentos obrigatórios estão reunidos. O próximo passo é revisar o
 relatório do seu perfil e conferir os pontos de atenção antes de preencher.
 </p>
 <div className="flex flex-col sm:flex-row gap-3">
 <Link
 href="/relatorio"
 className="inline-flex items-center justify-center rounded-lg bg-success-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-success-800 transition-colors dark:bg-success-600 dark:hover:bg-success-700"
 >
 Ver relatório completo →
 </Link>
 <Link
 href="/guias"
 className="inline-flex items-center justify-center rounded-lg border border-success-700 px-5 py-2.5 text-sm font-semibold text-success-700 hover:bg-success-100 transition-colors dark:border-success-500 dark:text-success-400 dark:hover:bg-success-900/30"
 >
 Ler guias de preenchimento
 </Link>
 </div>
 </div>
 )}

 <Toast message="Salvo automaticamente" show={toastVisible} />
 <CorruptedDataToast />
 </div>
 );
}
