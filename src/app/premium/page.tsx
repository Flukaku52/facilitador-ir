"use client";

import Link from "next/link";
import LegalDisclaimer from "@/components/layout/LegalDisclaimer";
import { usePremium } from "@/lib/hooks/usePremium";
import {
  KIWIFY_CHECKOUT_URL,
  PREMIUM_PRICE_LABEL,
} from "@/lib/premium/constants";

const INCLUDED = [
  {
    title: "Guias completos de preenchimento",
    description:
      "Os 20 guias com documentos, onde declarar, passo a passo e erros comuns — pra você não travar em nenhuma tela do programa da Receita.",
  },
  {
    title: "Relatório em PDF",
    description:
      "Seu diagnóstico completo num PDF — pra você guardar, consultar na hora de preencher ou entregar pronto ao contador.",
  },
  {
    title: "Checklist com progresso",
    description:
      "Marque o que já separou e veja o que falta — pra nenhum comprovante ficar de fora na hora de preencher.",
  },
];

export default function PremiumPage() {
  const { isPremium, loading, user } = usePremium();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          ← Painel
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Preencha sua declaração sem medo de errar
        </h1>
        <p className="mt-2 text-body">
          O IR Facilitador te guia do primeiro documento até a revisão final —
          em linguagem simples, sem juridiquês.
        </p>
      </div>

      <section className="space-y-3">
        {INCLUDED.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-700 text-sm font-bold dark:bg-success-950 dark:text-success-400">
              ✓
            </span>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-center space-y-4 dark:border-primary-900 dark:bg-primary-950">
        <div>
          <p className="text-4xl font-bold text-primary-900 dark:text-primary-100">
            {PREMIUM_PRICE_LABEL}
          </p>
          <p className="mt-1 text-sm text-primary-800 dark:text-primary-200">
            Pagamento único, com acesso até o fim da temporada de declaração.
          </p>
          <p className="mt-2 text-xs text-primary-700 dark:text-primary-300">
            Pra comparar: um contador cobra a partir de R$ 150 só pra fazer uma
            declaração simples.
          </p>
        </div>

        {isPremium ? (
          <p className="rounded-lg bg-success-100 px-4 py-3 text-sm font-medium text-success-800 dark:bg-success-950 dark:text-success-300">
            ✓ Você já tem o acesso completo. Bons preenchimentos!
          </p>
        ) : loading ? (
          <div
            className="h-12 animate-pulse rounded-lg bg-primary-100 dark:bg-primary-900"
            aria-busy="true"
          />
        ) : user ? (
          <a
            href={KIWIFY_CHECKOUT_URL}
            className="inline-flex w-full items-center justify-center rounded-lg bg-premium-600 px-6 py-3 font-semibold text-white hover:bg-premium-700 transition-colors sm:w-auto"
          >
            Quero o acesso completo
          </a>
        ) : (
          <div className="space-y-2">
            <Link
              href="/cadastro?next=/premium"
              className="inline-flex w-full items-center justify-center rounded-lg bg-premium-600 px-6 py-3 font-semibold text-white hover:bg-premium-700 transition-colors sm:w-auto"
            >
              Criar conta para continuar
            </Link>
            <p className="text-xs text-primary-700 dark:text-primary-300">
              O acesso premium é liberado na sua conta — crie uma conta gratuita
              primeiro e você volta direto pra esta página.{" "}
              <Link href="/login?next=/premium" className="underline">
                Já tem conta? Entrar
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-1 text-sm text-primary-800 dark:text-primary-200">
          <p>Garantia de 7 dias: não gostou, devolvemos seu dinheiro.</p>
          <p>
            A liberação do acesso é feita manualmente em até algumas horas após
            a confirmação da compra — você receberá tudo na conta usada na
            compra.
          </p>
        </div>
      </section>

      <LegalDisclaimer />
    </div>
  );
}
