"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TaxProfile, ComplexityLevel } from "@/types/tax-profile";
import { ChecklistItem } from "@/types/checklist";
import { TaxAlert } from "@/types/alert";
import { Guide } from "@/types/guide";
import { useStoredProfile } from "@/lib/hooks/useStoredProfile";
import { useChecklistStore } from "@/lib/hooks/useChecklistStore";
import { usePremium } from "@/lib/hooks/usePremium";
import PdfLockedButton from "@/components/report/PdfLockedButton";
import UpgradeCta, { upgradeHref } from "@/components/premium/UpgradeCta";
import {
  classifyComplexity,
  generateChecklist,
  generateAlerts,
  getApplicableGuideSlugs,
} from "@/lib/rules/tax-rules";
import { GUIDES } from "@/lib/data/guides";
import {
  decodeSharedPayload,
  encodeSharedPayload,
} from "@/lib/utils/share-link";
import { ComplexityBadge } from "@/components/ui/Badge";
import AlertBox from "@/components/ui/AlertBox";
import LegalDisclaimer from "@/components/layout/LegalDisclaimer";
import Toast from "@/components/ui/Toast";
import CorruptedDataToast from "@/components/ui/CorruptedDataToast";
import { ReportSkeleton } from "@/components/ui/Skeleton";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import ErrorFallback from "@/components/layout/ErrorFallback";

// DownloadPDFButton uses @react-pdf/renderer which requires browser APIs — must be client-only
const DownloadPDFButton = dynamic(
  () => import("@/components/report/DownloadPDFButton"),
  { ssr: false },
);

const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  simple: "Simples",
  medium: "Média",
  complex: "Complexa",
};

function buildReportText(
  profile: TaxProfile,
  complexity: ComplexityLevel,
  checklist: ChecklistItem[],
  guides: Guide[],
  alerts: TaxAlert[],
): string {
  const pending = checklist.filter((i) => i.required && !i.completed);
  const lines: string[] = [
    "RESUMO DO SEU DIAGNÓSTICO DE IMPOSTO DE RENDA",
    "=".repeat(50),
    `Ano-base: ${profile.taxYear}`,
    `Complexidade estimada: ${COMPLEXITY_LABELS[complexity]}`,
    "",
    "PERFIL IDENTIFICADO:",
    ...[
      profile.income.hasCltIncome ? "- Trabalho CLT: sim" : "",
      profile.income.hasPensionOrRetirement ? "- Aposentadoria/INSS: sim" : "",
      profile.income.hasSelfEmploymentIncome
        ? "- Renda autônoma/freelancer: sim"
        : "",
      profile.income.hasRentIncome ? "- Aluguel recebido: sim" : "",
      profile.income.hasBusinessIncome ? "- Empresa/dividendos: sim" : "",
      profile.assets.hasBankAccounts ? "- Contas bancárias: sim" : "",
      profile.assets.hasInvestments ? "- Investimentos/corretora: sim" : "",
      profile.investments.soldVariableIncome
        ? "- Vendeu renda variável: sim"
        : "",
      profile.investments.hasEtfs ? "- ETFs: sim" : "",
      profile.assets.hasCrypto ? "- Criptoativos: sim" : "",
      profile.assets.hasProperty ? "- Imóvel: sim" : "",
      profile.assets.hasFinancedProperty ? "- Imóvel financiado: sim" : "",
      profile.assets.hasVehicle ? "- Veículo: sim" : "",
      profile.assets.hasForeignAssets ? "- Bens no exterior: sim" : "",
      profile.deductions.hasDependents ? "- Dependentes: sim" : "",
      profile.deductions.hasMedicalExpenses ? "- Despesas médicas: sim" : "",
      profile.deductions.hasEducationExpenses
        ? "- Despesas com educação: sim"
        : "",
      profile.deductions.hasPrivatePensionContributions
        ? "- Previdência privada: sim"
        : "",
      profile.deductions.hasAlimony ? "- Pensão alimentícia: sim" : "",
    ].filter(Boolean),
    "",
    "DOCUMENTOS A SEPARAR:",
    ...(checklist.length === 0
      ? ["- Nenhum documento identificado."]
      : checklist.map((i) => `- [${i.completed ? "X" : " "}] ${i.title}`)),
    "",
    ...(pending.length > 0
      ? [
          "DOCUMENTOS AINDA PENDENTES:",
          ...pending.map((i) => `- ${i.title}`),
          "",
        ]
      : []),
    ...(alerts.length > 0
      ? [
          "PONTOS DE ATENÇÃO:",
          ...alerts.flatMap((a) => {
            const sev =
              a.severity === "danger"
                ? "CRÍTICO"
                : a.severity === "warning"
                  ? "ATENÇÃO"
                  : "INFO";
            return [`[${sev}] ${a.title}`, `  ${a.message}`];
          }),
          "",
        ]
      : []),
    ...(guides.length > 0
      ? ["GUIAS RECOMENDADOS:", ...guides.map((g) => `- ${g.title}`), ""]
      : []),
    "PRÓXIMOS PASSOS:",
    "1. Separe os documentos marcados no checklist.",
    "2. Leia os guias para cada situação do seu perfil.",
    "3. Confira os pontos de atenção antes de preencher.",
    ...(complexity === "medium"
      ? [
          "4. Sua declaração tem situações que merecem atenção extra — leia os guias com cuidado antes de preencher.",
        ]
      : complexity === "complex"
        ? [
            "4. Declaração complexa — recomendamos revisão com contador ou especialista tributário antes do envio.",
          ]
        : []),
    "",
    "AVISO:",
    "Este relatório é educativo e organizacional. Não substitui contador ou orientação oficial da Receita Federal.",
  ];
  return lines.join("\n");
}

function ReportContent() {
  const searchParams = useSearchParams();
  const storedProfile = useStoredProfile();
  const checklistState = useChecklistStore();
  const { isPremium, user } = usePremium();
  const reportRef = useRef<HTMLDivElement>(null);
  const cancelShareRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  useEffect(() => {
    if (showShareConfirm) {
      cancelShareRef.current?.focus();
    }
  }, [showShareConfirm]);

  useEffect(() => {
    if (!showShareConfirm) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setShowShareConfirm(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showShareConfirm]);

  // 2.8 — Shared profile from URL ?d= param
  const sharedData = searchParams.get("d");
  const decodedShared = sharedData ? decodeSharedPayload(sharedData) : null;
  const isSharedView = !!sharedData;
  const isInvalidSharedLink = isSharedView && decodedShared === null;
  const profile = isSharedView
    ? (decodedShared?.profile ?? null)
    : storedProfile;
  const sharedChecklistState = decodedShared?.checklistState ?? {};

  const checklist = useMemo(() => {
    if (!profile) return [];
    return generateChecklist(profile, profile.taxYear).map((item) => ({
      ...item,
      // In shared view, prefer explicit toggles from the link; fall back to profile defaults.
      // In local view, prefer manual toggles from localStorage; fall back to profile defaults.
      completed: isSharedView
        ? (sharedChecklistState[item.id] ?? item.completed)
        : (checklistState[item.id] ?? item.completed),
    }));
    // sharedChecklistState is derived from URL param — stable reference within a render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, checklistState, isSharedView]);

  const alerts = useMemo(
    () => (profile ? generateAlerts(profile, profile.taxYear) : []),
    [profile],
  );
  const guides = useMemo(() => {
    if (!profile) return [];
    const slugs = getApplicableGuideSlugs(profile, profile.taxYear);
    return GUIDES.filter((g) => slugs.includes(g.slug));
  }, [profile]);

  if (isInvalidSharedLink) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Este link de relatório parece inválido ou expirado.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Peça para a pessoa gerar um novo link pelo relatório dela.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Ir para o início
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Você ainda não concluiu o diagnóstico.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Responda as perguntas para gerar seu relatório personalizado com
          checklist, guias e alertas.
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

  const complexity = classifyComplexity(profile, profile.taxYear);
  const pending = checklist.filter((i) => i.required && !i.completed);

  async function copyReport() {
    const text = buildReportText(
      profile!,
      complexity,
      checklist,
      guides,
      alerts,
    );
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

  // 3.1 — Print / Save as PDF
  function printReport() {
    window.print();
  }

  // 2.8 — Share via URL
  async function confirmAndShare() {
    const encoded = encodeSharedPayload(profile!, checklistState);
    const url = `${window.location.origin}/relatorio?d=${encoded}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {}
    setShowShareConfirm(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Relatório final
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {!isSharedView && (
            <Link
              href="/dashboard"
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Painel
            </Link>
          )}
          <button
            onClick={copyReport}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600"
          >
            {copied ? "✓ Copiado!" : "Copiar texto"}
          </button>
          {!isSharedView && (
            <button
              onClick={() => setShowShareConfirm(true)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600"
            >
              {shared ? "✓ Link copiado!" : "Compartilhar link"}
            </button>
          )}
          {user && isPremium ? (
            <DownloadPDFButton
              profile={profile}
              complexity={complexity}
              checklist={checklist}
              guides={guides}
              alerts={alerts}
            />
          ) : (
            <PdfLockedButton isLoggedIn={!!user} />
          )}
          {user && isPremium ? (
            <button
              onClick={printReport}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600"
            >
              Imprimir
            </button>
          ) : (
            <Link
              href={upgradeHref(!!user)}
              title="Disponível no acesso premium"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600"
            >
              <span aria-hidden="true">🔒</span> Imprimir
            </Link>
          )}
        </div>
      </div>

      {showShareConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowShareConfirm(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-confirm-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden">
            <div className="px-5 py-5 space-y-4">
              <h2
                id="share-confirm-title"
                className="font-semibold text-gray-900 dark:text-gray-100"
              >
                Compartilhar relatório
              </h2>
              <p className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                ⚠️ Este link pode conter informações pessoais do seu perfil
                fiscal. Compartilhe apenas com pessoas de confiança.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  ref={cancelShareRef}
                  onClick={() => setShowShareConfirm(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmAndShare}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Gerar link mesmo assim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSharedView && (
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm text-indigo-700 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-300 print:hidden">
          Você está visualizando um relatório compartilhado. As marcações do
          checklist refletem o estado no momento do compartilhamento.
        </div>
      )}

      <UpgradeCta description="Baixe o relatório em PDF e destrave o passo a passo completo dos guias." />

      <div ref={reportRef} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Ano-base: {profile.taxYear}
          </p>
          <ComplexityBadge level={complexity} />
          {complexity === "complex" && (
            <p className="mt-3 text-sm text-red-700 font-medium dark:text-red-400">
              Declaração com pontos de maior risco. Recomendamos revisão com
              contador antes do envio.
            </p>
          )}
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
            Perfil identificado
          </h2>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 columns-2">
            {profile.income.hasCltIncome && <li>✓ Trabalho CLT</li>}
            {profile.income.hasPensionOrRetirement && (
              <li>✓ Aposentadoria/INSS</li>
            )}
            {profile.income.hasSelfEmploymentIncome && (
              <li>✓ Renda autônoma</li>
            )}
            {profile.income.hasRentIncome && <li>✓ Aluguel recebido</li>}
            {profile.income.hasBusinessIncome && <li>✓ Empresa/dividendos</li>}
            {profile.assets.hasBankAccounts && <li>✓ Contas bancárias</li>}
            {profile.assets.hasInvestments && <li>✓ Corretora</li>}
            {profile.investments.soldVariableIncome && (
              <li>✓ Vendeu renda variável</li>
            )}
            {profile.investments.hasEtfs && <li>✓ ETFs</li>}
            {profile.assets.hasCrypto && <li>✓ Criptoativos</li>}
            {profile.assets.hasProperty && <li>✓ Imóvel</li>}
            {profile.assets.hasFinancedProperty && <li>✓ Imóvel financiado</li>}
            {profile.assets.hasVehicle && <li>✓ Veículo</li>}
            {profile.assets.hasForeignAssets && <li>✓ Bens no exterior</li>}
            {profile.deductions.hasDependents && <li>✓ Dependentes</li>}
            {profile.deductions.hasMedicalExpenses && (
              <li>✓ Despesas médicas</li>
            )}
            {profile.deductions.hasEducationExpenses && <li>✓ Educação</li>}
            {profile.deductions.hasPrivatePensionContributions && (
              <li>✓ Previdência privada</li>
            )}
            {profile.deductions.hasAlimony && <li>✓ Pensão alimentícia</li>}
          </ul>
        </section>

        {checklist.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
              Documentos ({checklist.filter((i) => i.completed).length}/
              {checklist.length} reunidos)
            </h2>
            <ul className="space-y-1.5 text-sm">
              {checklist.map((item) => (
                <li
                  key={item.id}
                  className={`flex items-start gap-2 ${item.completed ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}`}
                >
                  <span
                    className={
                      item.completed
                        ? "text-green-500"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {item.completed ? "✓" : "○"}
                  </span>
                  <span className={item.completed ? "line-through" : ""}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {pending.length > 0 && (
          <section className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950">
            <h2 className="font-semibold text-yellow-900 mb-3 dark:text-yellow-100">
              Pendências ({pending.length} documento
              {pending.length !== 1 ? "s" : ""})
            </h2>
            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
              {pending.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span>•</span>
                  {item.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {alerts.length > 0 && (
          <section>
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
              Pontos de atenção
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertBox
                  key={alert.id}
                  severity={alert.severity}
                  title={alert.title}
                >
                  {alert.message}
                </AlertBox>
              ))}
            </div>
          </section>
        )}

        {guides.length > 0 && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
              Guias recomendados
            </h2>
            <ul className="space-y-1.5 text-sm">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guias/${guide.slug}`}
                    className="text-indigo-600 hover:underline dark:text-indigo-400 print:text-gray-700"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950">
          <h2 className="font-semibold text-indigo-900 mb-3 dark:text-indigo-100">
            Próximos passos
          </h2>
          <ol className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
            <li className="flex gap-2">
              <span className="font-bold">1.</span> Separe todos os documentos
              marcados no checklist.
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span> Leia os guias para cada
              situação do seu perfil.
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span> Confira os pontos de atenção
              antes de preencher.
            </li>
            {complexity === "medium" && (
              <li className="flex gap-2">
                <span className="font-bold">4.</span> Sua declaração tem
                situações que merecem atenção extra — leia os guias com cuidado
                antes de preencher.
              </li>
            )}
            {complexity === "complex" && (
              <li className="flex gap-2 font-medium">
                <span className="font-bold">4.</span> Declaração complexa —
                considere revisão com contador ou especialista tributário.
              </li>
            )}
          </ol>
        </section>

        <LegalDisclaimer />
      </div>

      <Toast message="Link copiado!" show={shared} />
      <CorruptedDataToast />
    </div>
  );
}

export default function ReportPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<ReportSkeleton />}>
        <ReportContent />
      </Suspense>
    </ErrorBoundary>
  );
}
