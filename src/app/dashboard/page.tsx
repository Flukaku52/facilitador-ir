"use client";

import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoredProfile } from "@/lib/hooks/useStoredProfile";
import { useChecklistStore } from "@/lib/hooks/useChecklistStore";
import { clearDraft } from "@/lib/storage/local-profile-storage";
import {
  classifyComplexity,
  generateChecklist,
  generateAlerts,
  calculateChecklistProgress,
} from "@/lib/rules/tax-rules";
import { ComplexityBadge } from "@/components/ui/Badge";
import AlertBox from "@/components/ui/AlertBox";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import ClearDataModal from "@/components/layout/ClearDataModal";
import UpgradeCta from "@/components/premium/UpgradeCta";
import AskDialog from "@/components/ui/AskDialog";
import { isAiAssistantEnabled } from "@/env";
import CorruptedDataToast from "@/components/ui/CorruptedDataToast";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import ErrorFallback from "@/components/layout/ErrorFallback";

const GuestBanner = dynamic(() => import("@/components/layout/GuestBanner"), {
  ssr: false,
});

export default function DashboardPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const router = useRouter();
  const profile = useStoredProfile();
  const checklistState = useChecklistStore();

  const handleRestartQuestionnaire = useCallback(() => {
    clearDraft();
    router.push("/questionario");
  }, [router]);

  const checklist = useMemo(() => {
    if (!profile) return [];
    return generateChecklist(profile, profile.taxYear).map((item) => ({
      ...item,
      completed: checklistState[item.id] ?? item.completed,
    }));
  }, [profile, checklistState]);

  const alerts = useMemo(
    () => (profile ? generateAlerts(profile, profile.taxYear) : []),
    [profile],
  );
  const progress = useMemo(
    () => calculateChecklistProgress(checklist),
    [checklist],
  );

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Você ainda não concluiu o diagnóstico.
        </p>
        <p className="mt-2 text-sm text-muted">
          Responda as perguntas para ver seu painel e checklist de documentos.
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

  const complexity = classifyComplexity(profile, profile.taxYear);
  const pendingCount = checklist.filter(
    (i) => i.required && !i.completed,
  ).length;
  const dangerAlerts = alerts.filter((a) => a.severity === "danger");
  const isEmpty = checklist.length === 0 && alerts.length === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <GuestBanner />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Seu painel
        </h1>
        <Link
          href="/questionario/editar"
          className="text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          Editar respostas
        </Link>
      </div>

      {isEmpty ? (
        <Card>
          <p className="font-medium text-body">
            Seu diagnóstico foi concluído, mas nenhuma pendência principal foi
            identificada com as respostas atuais.
          </p>
          <p className="mt-2 text-sm text-muted">
            Se suas informações mudaram, você pode revisar suas respostas ou
            refazer o questionário.
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <p className="text-sm text-muted mb-2">
              Complexidade estimada
            </p>
            <ComplexityBadge level={complexity} />
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {complexity === "simple" &&
                "Sua declaração parece relativamente simples. Siga o checklist e os guias indicados."}
              {complexity === "medium" &&
                "Sua declaração tem alguns pontos que exigem atenção. Leia os guias com cuidado."}
              {complexity === "complex" &&
                "Sua declaração tem pontos de maior risco. Recomendamos revisão com contador antes do envio."}
            </p>
          </Card>

          <UpgradeCta />

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="text-center">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {checklist.length}
              </p>
              <p className="text-sm text-muted mt-1">
                documentos
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">
                {pendingCount}
              </p>
              <p className="text-sm text-muted mt-1">
                pendentes
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">
                {alerts.length}
              </p>
              <p className="text-sm text-muted mt-1">
                alertas
              </p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">
                Progresso do checklist
              </h2>
              <Link
                href="/checklist"
                className="text-sm text-primary-600 hover:underline dark:text-primary-400"
              >
                Ver checklist →
              </Link>
            </div>
            <ProgressBar value={progress} />
          </Card>

          {dangerAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-foreground">
                Pontos críticos
              </h2>
              {dangerAlerts.map((alert) => (
                <AlertBox key={alert.id} severity="danger" title={alert.title}>
                  {alert.message}
                </AlertBox>
              ))}
            </div>
          )}
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {isEmpty ? (
          <>
            <Link
              href="/questionario/editar"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                ✏️
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Editar respostas
                </p>
                <p className="text-sm text-muted">
                  Revise o que você informou
                </p>
              </div>
            </Link>
            <Link
              href="/relatorio"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                📋
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Ver relatório
                </p>
                <p className="text-sm text-muted">
                  Resumo do seu diagnóstico
                </p>
              </div>
            </Link>
            <button
              onClick={handleRestartQuestionnaire}
              className="flex w-full items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition sm:col-span-2 text-left dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                ↩️
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Refazer questionário
                </p>
                <p className="text-sm text-muted">
                  Responder tudo novamente do início
                </p>
              </div>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/checklist"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                ✓
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Checklist
                </p>
                <p className="text-sm text-muted">
                  Marque o que já separou
                </p>
              </div>
            </Link>
            <Link
              href="/guias"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                📖
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Guias
                </p>
                <p className="text-sm text-muted">
                  Instruções para cada situação
                </p>
              </div>
            </Link>
            <Link
              href="/relatorio"
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm hover:border-primary-300 hover:shadow-md transition sm:col-span-2 dark:hover:border-primary-600"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold dark:bg-primary-950 dark:text-primary-400">
                📋
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  Relatório final
                </p>
                <p className="text-sm text-muted">
                  Resumo completo para copiar ou imprimir
                </p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* 6.2 — Clear data button */}
      <div className="text-center pt-4">
        <ClearDataModal />
      </div>

      {isAiAssistantEnabled && <AskDialog profile={profile} />}
      <CorruptedDataToast />
    </div>
  );
}
