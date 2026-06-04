'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { ChecklistItem, ChecklistCategory } from '@/types/checklist';
import {
  loadTaxProfile,
  loadChecklistState,
  saveChecklistState,
} from '@/lib/storage/local-profile-storage';
import { generateChecklist, calculateChecklistProgress } from '@/lib/rules/tax-rules';
import ChecklistGroup from '@/components/checklist/ChecklistGroup';
import ProgressBar from '@/components/ui/ProgressBar';

const CATEGORY_ORDER: ChecklistCategory[] = [
  'income',
  'bank',
  'assets',
  'investments',
  'deductions',
  'complex_cases',
  'other',
];

export default function ChecklistPage() {
  const [items, setItems] = useState<ChecklistItem[] | null>(null);

  useEffect(() => {
    const p = loadTaxProfile();
    if (!p) {
      startTransition(() => setItems([]));
      return;
    }
    const savedState = loadChecklistState();
    const generated = generateChecklist(p).map((item) => ({
      ...item,
      completed: savedState[item.id] ?? item.completed,
    }));
    startTransition(() => setItems(generated));
  }, []);

  function handleToggle(id: string) {
    setItems((prev) => {
      if (!prev) return prev;
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      saveChecklistState(updated);
      return updated;
    });
  }

  if (items === null) return null;

  if (items.length === 0) {
    const hasProfile = typeof window !== 'undefined' && !!localStorage.getItem('ir_facilitador_profile');
    if (!hasProfile) {
      return (
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-lg text-gray-600">
            Responda o questionário para gerar seu checklist personalizado.
          </p>
          <Link
            href="/questionario"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
          >
            Começar questionário
          </Link>
        </div>
      );
    }
  }

  const progress = calculateChecklistProgress(items);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Checklist de documentos</h1>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
          ← Painel
        </Link>
      </div>

      <ProgressBar value={progress} label="Documentos obrigatórios reunidos" />

      {CATEGORY_ORDER.map((cat) => {
        const group = items.filter((i) => i.category === cat);
        return (
          <ChecklistGroup
            key={cat}
            category={cat}
            items={group}
            onToggle={handleToggle}
          />
        );
      })}

      {items.length === 0 && (
        <p className="text-gray-500 text-center py-8">Nenhum item gerado para o seu perfil.</p>
      )}
    </div>
  );
}
