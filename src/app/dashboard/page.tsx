'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { TaxProfile } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';
import { TaxAlert } from '@/types/alert';
import { loadTaxProfile, loadChecklistState } from '@/lib/storage/local-profile-storage';
import {
  classifyComplexity,
  generateChecklist,
  generateAlerts,
  calculateChecklistProgress,
} from '@/lib/rules/tax-rules';
import { ComplexityBadge } from '@/components/ui/Badge';
import AlertBox from '@/components/ui/AlertBox';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';

interface DashboardState {
  profile: TaxProfile;
  checklist: ChecklistItem[];
  alerts: TaxAlert[];
  progress: number;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    const p = loadTaxProfile();
    if (!p) return;
    const savedState = loadChecklistState();
    const items = generateChecklist(p).map((item) => ({
      ...item,
      completed: savedState[item.id] ?? item.completed,
    }));
    startTransition(() => {
      setState({
        profile: p,
        checklist: items,
        alerts: generateAlerts(p),
        progress: calculateChecklistProgress(items),
      });
    });
  }, []);

  if (!state) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Você ainda não concluiu o diagnóstico.</p>
        <Link
          href="/questionario"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors"
        >
          Começar questionário
        </Link>
      </div>
    );
  }

  const { profile, checklist, alerts, progress } = state;
  const complexity = classifyComplexity(profile);
  const pendingCount = checklist.filter((i) => i.required && !i.completed).length;
  const dangerAlerts = alerts.filter((a) => a.severity === 'danger');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Seu painel</h1>
        <Link href="/questionario" className="text-sm text-indigo-600 hover:underline">
          Refazer diagnóstico
        </Link>
      </div>

      {/* Complexity */}
      <Card>
        <p className="text-sm text-gray-500 mb-2">Complexidade estimada</p>
        <ComplexityBadge level={complexity} />
        <p className="mt-3 text-sm text-gray-600">
          {complexity === 'simple' &&
            'Sua declaração parece relativamente simples. Siga o checklist e os guias indicados.'}
          {complexity === 'medium' &&
            'Sua declaração tem alguns pontos que exigem atenção. Leia os guias com cuidado.'}
          {complexity === 'complex' &&
            'Sua declaração tem pontos de maior risco. Recomendamos revisão com contador antes do envio.'}
        </p>
      </Card>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{checklist.length}</p>
          <p className="text-sm text-gray-500 mt-1">documentos no checklist</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-500 mt-1">pendentes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
          <p className="text-sm text-gray-500 mt-1">alertas</p>
        </Card>
      </div>

      {/* Checklist progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Progresso do checklist</h2>
          <Link href="/checklist" className="text-sm text-indigo-600 hover:underline">
            Ver checklist →
          </Link>
        </div>
        <ProgressBar value={progress} />
      </Card>

      {/* Danger alerts */}
      {dangerAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Pontos críticos</h2>
          {dangerAlerts.map((alert) => (
            <AlertBox key={alert.id} severity="danger" title={alert.title}>
              {alert.message}
            </AlertBox>
          ))}
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/checklist"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
            ✓
          </div>
          <div>
            <p className="font-semibold text-gray-900">Checklist de documentos</p>
            <p className="text-sm text-gray-500">Marque o que já separou</p>
          </div>
        </Link>
        <Link
          href="/guias"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
            📖
          </div>
          <div>
            <p className="font-semibold text-gray-900">Guias de preenchimento</p>
            <p className="text-sm text-gray-500">Instruções para cada situação</p>
          </div>
        </Link>
        <Link
          href="/relatorio"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition sm:col-span-2"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
            📋
          </div>
          <div>
            <p className="font-semibold text-gray-900">Relatório final</p>
            <p className="text-sm text-gray-500">Resumo completo para copiar ou imprimir</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
