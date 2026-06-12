"use client";

import Link from "next/link";
import { Guide } from "@/types/guide";
import { usePremium } from "@/lib/hooks/usePremium";
import { upgradeHref } from "@/components/premium/UpgradeCta";
import { PREMIUM_PRICE_LABEL } from "@/lib/premium/constants";

const LOCKED_SECTION_TITLES = [
  "Documentos necessários",
  "Onde declarar no programa",
  "Como preencher (passo a passo)",
  "Erros comuns para evitar",
];

// Seções premium do guia. Para não-premium o conteúdo NÃO é renderizado —
// apenas um placeholder com CTA (renderização condicional, sem desfoque sobre texto real).
export default function GuideGatedSections({ guide }: { guide: Guide }) {
  const { isPremium, loading, user } = usePremium();

  if (loading) {
    return (
      <div className="space-y-8" aria-busy="true">
        {LOCKED_SECTION_TITLES.map((title) => (
          <div
            key={title}
            className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  // Guarda explícita: convidado (sem user) é sempre bloqueado, mesmo que o
  // estado do hook esteja inconsistente.
  if (!user || !isPremium) {
    return (
      <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 space-y-4 dark:border-indigo-900 dark:bg-indigo-950">
        <h2 className="font-semibold text-indigo-900 dark:text-indigo-100">
          Conteúdo completo deste guia
        </h2>
        <ul className="space-y-2">
          {LOCKED_SECTION_TITLES.map((title) => (
            <li
              key={title}
              className="flex items-center gap-2 text-sm text-indigo-800 dark:text-indigo-200"
            >
              <span aria-hidden="true">🔒</span>
              {title}
            </li>
          ))}
        </ul>
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          Estas seções fazem parte do acesso premium: {PREMIUM_PRICE_LABEL} com
          acesso até o fim da temporada de declaração.
        </p>
        <Link
          href={upgradeHref(!!user)}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Quero o acesso completo
        </Link>
        {!user && (
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            Você vai criar uma conta gratuita primeiro — o acesso premium é
            liberado nela.
          </p>
        )}
      </section>
    );
  }

  return (
    <>
      <section>
        <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
          Documentos necessários
        </h2>
        <ul className="space-y-2">
          {guide.documentsNeeded.map((doc, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                •
              </span>
              {doc}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="font-semibold text-gray-900 mb-2 dark:text-gray-100">
          Onde declarar no programa
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {guide.whereToDeclare}
        </p>
      </section>

      <section>
        <h2 className="font-semibold text-gray-900 mb-3 dark:text-gray-100">
          Como preencher
        </h2>
        <ol className="space-y-3">
          {guide.howToFill.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs dark:bg-indigo-950 dark:text-indigo-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-5 dark:border-yellow-900 dark:bg-yellow-950">
        <h2 className="font-semibold text-yellow-900 mb-3 dark:text-yellow-100">
          Erros comuns para evitar
        </h2>
        <ul className="space-y-2">
          {guide.commonMistakes.map((mistake, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200"
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
