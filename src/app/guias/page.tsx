"use client";

import Link from "next/link";
import { useMemo } from "react";
import { GUIDES } from "@/lib/data/guides";
import { Guide } from "@/types/guide";
import { useStoredProfile } from "@/lib/hooks/useStoredProfile";
import { getApplicableGuideSlugs } from "@/lib/rules/tax-rules";
import GuideCard from "@/components/guides/GuideCard";
import UpgradeCta from "@/components/premium/UpgradeCta";
import { GuidesSkeleton } from "@/components/ui/Skeleton";
import CorruptedDataToast from "@/components/ui/CorruptedDataToast";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import ErrorFallback from "@/components/layout/ErrorFallback";

export default function GuidesPage() {
 return (
 <ErrorBoundary fallback={<ErrorFallback />}>
 <GuidesContent />
 </ErrorBoundary>
 );
}

function GuidesContent() {
 const profile = useStoredProfile();

 const guides: Guide[] = useMemo(() => {
 if (profile) {
 const slugs = getApplicableGuideSlugs(profile, profile.taxYear);
 return GUIDES.filter((g) => slugs.includes(g.slug));
 }
 return GUIDES;
 }, [profile]);

 if (guides.length === 0 && !profile) return <GuidesSkeleton />;

 const alertGuides = guides.filter((g) => g.isAlert);
 const regularGuides = guides.filter((g) => !g.isAlert);

 return (
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-foreground">
 Guias de preenchimento
 </h1>
 <p className="mt-1 text-sm text-muted">
 {guides.length} guia{guides.length !== 1 ? "s" : ""} para o seu
 perfil
 </p>
 </div>
 <Link
 href="/dashboard"
 className="text-sm text-primary-600 hover:underline dark:text-primary-400"
 >
 ← Painel
 </Link>
 </div>

 <UpgradeCta description="Veja documentos, onde declarar e o passo a passo completo de cada guia." />

 {regularGuides.length > 0 && (
 <section>
 <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
 Guias aplicáveis
 </h2>
 <div className="grid gap-4 sm:grid-cols-2">
 {regularGuides.map((guide) => (
 <GuideCard key={guide.slug} guide={guide} />
 ))}
 </div>
 </section>
 )}

 {alertGuides.length > 0 && (
 <section>
 <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-danger-500 dark:text-danger-400">
 Situações que exigem atenção especial
 </h2>
 <div className="grid gap-4 sm:grid-cols-2">
 {alertGuides.map((guide) => (
 <GuideCard key={guide.slug} guide={guide} />
 ))}
 </div>
 </section>
 )}

 {guides.length === 0 && (
 <div className="text-center py-8 space-y-3">
 <p className="text-muted">
 Nenhum guia aplicável foi identificado com as respostas atuais.
 </p>
 <p className="text-sm text-muted">
 Se suas informações mudaram, revise suas respostas.
 </p>
 <Link
 href="/questionario/editar"
 className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Editar respostas
 </Link>
 </div>
 )}
 <CorruptedDataToast />
 </div>
 );
}
