"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePremium } from "@/lib/hooks/usePremium";
import { upgradeHref } from "@/components/premium/UpgradeCta";
import { PREMIUM_PRICE_LABEL } from "@/lib/premium/constants";
import { PremiumGuideSections } from "@/lib/premium/guide-sections";

const LOCKED_SECTION_TITLES = [
 "Documentos necessários",
 "Onde declarar no programa",
 "Como preencher (passo a passo)",
 "Erros comuns para evitar",
];

function LockedSkeleton() {
 return (
 <div className="space-y-8" aria-busy="true">
 {LOCKED_SECTION_TITLES.map((title) => (
 <div
 key={title}
 className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
 />
 ))}
 </div>
 );
}

function LockedPlaceholder({ hasUser }: { hasUser: boolean }) {
 return (
 <section className="rounded-xl border border-primary-200 bg-primary-50 p-6 space-y-4 dark:border-primary-900 dark:bg-primary-950">
 <h2 className="font-semibold text-primary-900 dark:text-primary-100">
 Conteúdo completo deste guia
 </h2>
 <ul className="space-y-2">
 {LOCKED_SECTION_TITLES.map((title) => (
 <li
 key={title}
 className="flex items-center gap-2 text-sm text-primary-800 dark:text-primary-200"
 >
 <span aria-hidden="true">🔒</span>
 {title}
 </li>
 ))}
 </ul>
 <p className="text-sm text-primary-800 dark:text-primary-200">
 Estas seções fazem parte do acesso premium: {PREMIUM_PRICE_LABEL} com
 acesso até o fim da temporada de declaração.
 </p>
 <Link
 href={upgradeHref(hasUser)}
 className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Quero o acesso completo
 </Link>
 {!hasUser && (
 <p className="text-xs text-primary-700 dark:text-primary-300">
 Você vai criar uma conta gratuita primeiro — o acesso premium é
 liberado nela.
 </p>
 )}
 </section>
 );
}

function PremiumSections({ data }: { data: PremiumGuideSections }) {
 return (
 <>
 <section>
 <h2 className="font-semibold text-foreground mb-3">
 Documentos necessários
 </h2>
 <ul className="space-y-2">
 {data.documentsNeeded.map((doc, i) => (
 <li
 key={i}
 className="flex items-start gap-2 text-sm text-body"
 >
 <span className="mt-0.5 text-primary-600 dark:text-primary-400 shrink-0">
 •
 </span>
 {doc}
 </li>
 ))}
 </ul>
 </section>

 <section className="rounded-lg border border-border bg-surface p-5">
 <h2 className="font-semibold text-foreground mb-2">
 Onde declarar no programa
 </h2>
 <p className="text-sm text-body">
 {data.whereToDeclare}
 </p>
 </section>

 <section>
 <h2 className="font-semibold text-foreground mb-3">
 Como preencher
 </h2>
 <ol className="space-y-3">
 {data.howToFill.map((step, i) => (
 <li
 key={i}
 className="flex items-start gap-3 text-sm text-body"
 >
 <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-xs dark:bg-primary-950 dark:text-primary-400">
 {i + 1}
 </span>
 {step}
 </li>
 ))}
 </ol>
 </section>

 <section className="rounded-lg border border-warning-200 bg-warning-50 p-5 dark:border-warning-900 dark:bg-warning-950">
 <h2 className="font-semibold text-warning-900 mb-3 dark:text-warning-100">
 Erros comuns para evitar
 </h2>
 <ul className="space-y-2">
 {data.commonMistakes.map((mistake, i) => (
 <li
 key={i}
 className="flex items-start gap-2 text-sm text-warning-800 dark:text-warning-200"
 >
 <span className="mt-0.5 shrink-0 font-bold">!</span>
 {mistake}
 </li>
 ))}
 </ul>
 </section>
 </>
 );
}

type FetchResult = {
 slug: string;
 sections: PremiumGuideSections | null;
};

// Recebe apenas o slug — o conteúdo travado NUNCA chega como prop (não vaza no
// RSC). Para premium, busca o conteúdo numa rota que autentica e checa premium
// no servidor; não-premium/convidado vê só o placeholder + CTA.
export default function GuideGatedSections({ slug }: { slug: string }) {
 const { isPremium, loading, user } = usePremium();
 const [result, setResult] = useState<FetchResult | null>(null);

 useEffect(() => {
 // Só busca quando há premium ativo. Convidado/não-premium não dispara fetch
 // (e mesmo se disparasse, o servidor responde 403 sem conteúdo).
 if (!user || !isPremium) return;
 let mounted = true;
 fetch(`/api/guias/${slug}/premium-sections`)
 .then(async (res): Promise<PremiumGuideSections | null> => {
 if (!res.ok) return null;
 return (await res.json()) as PremiumGuideSections;
 })
 .catch(() => null)
 .then((sections) => {
 if (mounted) setResult({ slug, sections });
 });
 return () => {
 mounted = false;
 };
 }, [slug, user, isPremium]);

 if (loading) return <LockedSkeleton />;
 if (!user || !isPremium) return <LockedPlaceholder hasUser={!!user} />;

 // Premium: aguarda o fetch desta slug. Erro/403 cai no placeholder (fail-safe).
 const ready = result !== null && result.slug === slug;
 if (!ready) return <LockedSkeleton />;
 if (!result.sections) return <LockedPlaceholder hasUser={!!user} />;
 return <PremiumSections data={result.sections} />;
}
