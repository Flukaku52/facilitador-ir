'use client';

import { useEffect, useState, useRef, startTransition } from 'react';
import Link from 'next/link';
import { TaxProfile, ComplexityLevel } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';
import { TaxAlert } from '@/types/alert';
import { Guide } from '@/types/guide';
import { loadTaxProfile, loadChecklistState } from '@/lib/storage/local-profile-storage';
import {
  classifyComplexity,
  generateChecklist,
  generateAlerts,
  getApplicableGuideSlugs,
} from '@/lib/rules/tax-rules';
import { GUIDES } from '@/lib/data/guides';
import { ComplexityBadge } from '@/components/ui/Badge';
import AlertBox from '@/components/ui/AlertBox';
import LegalDisclaimer from '@/components/layout/LegalDisclaimer';

interface ReportState {
  profile: TaxProfile;
  checklist: ChecklistItem[];
  alerts: TaxAlert[];
  guides: Guide[];
}

const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  simple: 'Simples',
  medium: 'Média',
  complex: 'Complexa',
};

function buildReportText(
  profile: TaxProfile,
  complexity: ComplexityLevel,
  checklist: ChecklistItem[],
  guides: Guide[],
  alerts: TaxAlert[],
): string {
  const pending = checklist.filter((i) => i.required && !i.completed);
  const lines: string[] = [];

  lines.push('RESUMO DO SEU DIAGNÓSTICO DE IMPOSTO DE RENDA');
  lines.push('='.repeat(50));
  lines.push(`Ano-base: ${profile.taxYear}`);
  lines.push(`Complexidade estimada: ${COMPLEXITY_LABELS[complexity]}`);
  lines.push('');

  lines.push('PERFIL IDENTIFICADO:');
  const flags: string[] = [
    profile.income.hasCltIncome ? '- Trabalho CLT: sim' : '',
    profile.income.hasPensionOrRetirement ? '- Aposentadoria/INSS: sim' : '',
    profile.income.hasSelfEmploymentIncome ? '- Renda autônoma/freelancer: sim' : '',
    profile.income.hasRentIncome ? '- Aluguel recebido: sim' : '',
    profile.assets.hasBankAccounts ? '- Contas bancárias: sim' : '',
    profile.assets.hasInvestments ? '- Investimentos/corretora: sim' : '',
    profile.investments.soldVariableIncome ? '- Vendeu renda variável: sim' : '',
    profile.assets.hasCrypto ? '- Criptoativos: sim' : '',
    profile.assets.hasProperty ? '- Imóvel: sim' : '',
    profile.assets.hasFinancedProperty ? '- Imóvel financiado: sim' : '',
    profile.assets.hasVehicle ? '- Veículo: sim' : '',
    profile.assets.hasForeignAssets ? '- Bens no exterior: sim' : '',
    profile.deductions.hasDependents ? '- Dependentes: sim' : '',
    profile.deductions.hasMedicalExpenses ? '- Despesas médicas: sim' : '',
    profile.deductions.hasEducationExpenses ? '- Despesas com educação: sim' : '',
    profile.deductions.hasPrivatePensionContributions ? '- Previdência privada: sim' : '',
    profile.deductions.hasAlimony ? '- Pensão alimentícia: sim' : '',
  ].filter((s) => s.length > 0);
  lines.push(...(flags.length > 0 ? flags : ['- Perfil básico']));
  lines.push('');

  lines.push('DOCUMENTOS A SEPARAR:');
  if (checklist.length === 0) {
    lines.push('- Nenhum documento identificado.');
  } else {
    for (const item of checklist) {
      lines.push(`- [${item.completed ? 'X' : ' '}] ${item.title}`);
    }
  }
  lines.push('');

  if (pending.length > 0) {
    lines.push('DOCUMENTOS AINDA PENDENTES:');
    for (const item of pending) lines.push(`- ${item.title}`);
    lines.push('');
  }

  if (alerts.length > 0) {
    lines.push('PONTOS DE ATENÇÃO:');
    for (const alert of alerts) {
      const sev =
        alert.severity === 'danger' ? 'CRÍTICO' : alert.severity === 'warning' ? 'ATENÇÃO' : 'INFO';
      lines.push(`[${sev}] ${alert.title}`);
      lines.push(`  ${alert.message}`);
    }
    lines.push('');
  }

  if (guides.length > 0) {
    lines.push('GUIAS RECOMENDADOS:');
    for (const guide of guides) lines.push(`- ${guide.title}`);
    lines.push('');
  }

  lines.push('PRÓXIMOS PASSOS:');
  lines.push('1. Separe os documentos marcados no checklist.');
  lines.push('2. Leia os guias para cada situação do seu perfil.');
  lines.push('3. Confira os pontos de atenção antes de preencher a declaração.');
  if (complexity === 'complex') {
    lines.push(
      '4. Sua declaração é complexa — recomendamos revisão com contador antes do envio.',
    );
  }
  lines.push('');
  lines.push('AVISO:');
  lines.push(
    'Este relatório é educativo e organizacional. Ele não substitui contador ou orientação oficial da Receita Federal.',
  );

  return lines.join('\n');
}

export default function ReportPage() {
  const [data, setData] = useState<ReportState | null>(null);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = loadTaxProfile();
    if (!p) return;
    const savedState = loadChecklistState();
    const items = generateChecklist(p).map((item) => ({
      ...item,
      completed: savedState[item.id] ?? item.completed,
    }));
    const slugs = getApplicableGuideSlugs(p);
    startTransition(() => {
      setData({
        profile: p,
        checklist: items,
        alerts: generateAlerts(p),
        guides: GUIDES.filter((g) => slugs.includes(g.slug)),
      });
    });
  }, []);

  async function copyReport() {
    if (!data) return;
    const complexity = classifyComplexity(data.profile);
    const text = buildReportText(data.profile, complexity, data.checklist, data.guides, data.alerts);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      if (reportRef.current) {
        const range = document.createRange();
        range.selectNode(reportRef.current);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">Você ainda não concluiu o diagnóstico.</p>
        <Link
          href="/questionario"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Começar questionário
        </Link>
      </div>
    );
  }

  const { profile, checklist, alerts, guides } = data;
  const complexity = classifyComplexity(profile);
  const pending = checklist.filter((i) => i.required && !i.completed);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatório final</h1>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            ← Painel
          </Link>
          <button
            onClick={copyReport}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {copied ? '✓ Copiado!' : 'Copiar relatório'}
          </button>
        </div>
      </div>

      <div ref={reportRef} className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ano-base: {profile.taxYear}</p>
          <ComplexityBadge level={complexity} />
          {complexity === 'complex' && (
            <p className="mt-3 text-sm text-red-700 font-medium dark:text-red-400">
              Sua declaração possui pontos de maior risco. Recomendamos revisão com contador antes
              do envio.
            </p>
          )}
        </div>

        {/* Perfil */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Perfil identificado</h2>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {profile.income.hasCltIncome && <li>✓ Trabalho CLT</li>}
            {profile.income.hasPensionOrRetirement && <li>✓ Aposentadoria ou INSS</li>}
            {profile.income.hasSelfEmploymentIncome && <li>✓ Renda autônoma / freelancer</li>}
            {profile.income.hasRentIncome && <li>✓ Aluguel recebido</li>}
            {profile.assets.hasBankAccounts && <li>✓ Contas bancárias</li>}
            {profile.assets.hasInvestments && <li>✓ Investimentos / corretora</li>}
            {profile.investments.soldVariableIncome && <li>✓ Vendeu renda variável</li>}
            {profile.assets.hasCrypto && <li>✓ Criptoativos</li>}
            {profile.assets.hasProperty && <li>✓ Imóvel</li>}
            {profile.assets.hasFinancedProperty && <li>✓ Imóvel financiado</li>}
            {profile.assets.hasVehicle && <li>✓ Veículo</li>}
            {profile.assets.hasForeignAssets && <li>✓ Bens no exterior</li>}
            {profile.deductions.hasDependents && <li>✓ Dependentes</li>}
            {profile.deductions.hasMedicalExpenses && <li>✓ Despesas médicas</li>}
            {profile.deductions.hasEducationExpenses && <li>✓ Despesas com educação</li>}
            {profile.deductions.hasPrivatePensionContributions && <li>✓ Previdência privada</li>}
            {profile.deductions.hasAlimony && <li>✓ Pensão alimentícia</li>}
          </ul>
        </section>

        {/* Checklist */}
        {checklist.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
              Documentos ({checklist.filter((i) => i.completed).length}/{checklist.length} reunidos)
            </h2>
            <ul className="space-y-1.5 text-sm">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-2 ${item.completed ? 'text-gray-400' : 'text-gray-700'}`}
                >
                  <span className={item.completed ? 'text-green-500' : 'text-gray-400'}>
                    {item.completed ? '✓' : '○'}
                  </span>
                  <span className={item.completed ? 'line-through' : ''}>{item.title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950">
            <h2 className="font-semibold text-yellow-900 mb-3 dark:text-yellow-100">
              Pendências ({pending.length} documento{pending.length !== 1 ? 's' : ''})
            </h2>
            <ul className="space-y-1 text-sm text-yellow-800">
              {pending.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
                  <span>•</span> {item.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <section>
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Pontos de atenção</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertBox key={alert.id} severity={alert.severity} title={alert.title}>
                  {alert.message}
                </AlertBox>
              ))}
            </div>
          </section>
        )}

        {/* Guides */}
        {guides.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">Guias recomendados</h2>
            <ul className="space-y-1.5 text-sm">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guias/${guide.slug}`} className="text-indigo-600 hover:underline dark:text-indigo-400">
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Next steps */}
        <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950">
          <h2 className="font-semibold text-indigo-900 mb-3 dark:text-indigo-100">Próximos passos</h2>
          <ol className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
            <li className="flex gap-2">
              <span className="font-bold">1.</span> Separe todos os documentos marcados no checklist.
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span> Leia os guias para cada situação do seu perfil.
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span> Confira os pontos de atenção antes de preencher.
            </li>
            {complexity === 'complex' && (
              <li className="flex gap-2 font-medium">
                <span className="font-bold">4.</span> Declaração complexa — considere revisão com
                contador.
              </li>
            )}
          </ol>
        </section>

        <LegalDisclaimer />
      </div>
    </div>
  );
}
