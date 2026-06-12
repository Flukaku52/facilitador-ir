"use client";

import Link from "next/link";
import { usePremium } from "@/lib/hooks/usePremium";
import { PREMIUM_PRICE_LABEL } from "@/lib/premium/constants";

// O premium exige conta (liberação manual por usuário): convidado vai criar
// conta primeiro e o callback de auth o devolve em /premium.
export function upgradeHref(isLoggedIn: boolean): string {
  return isLoggedIn ? "/premium" : "/cadastro?next=/premium";
}

// Banner de upgrade. Some para usuário premium ativo (e enquanto carrega o status).
export default function UpgradeCta({
  description = `Guias completos, PDF do relatório e checklist com progresso por ${PREMIUM_PRICE_LABEL} até o fim da temporada.`,
}: {
  description?: string;
}) {
  const { isPremium, loading, user } = usePremium();
  if (loading || isPremium) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-premium-200 bg-premium-50 p-4 dark:border-premium-800 dark:bg-premium-950 print:hidden">
      <div className="min-w-0">
        <p className="font-semibold text-premium-900 dark:text-premium-100">
          Destrave o passo a passo completo
        </p>
        <p className="mt-0.5 text-sm text-premium-800 dark:text-premium-200">
          {description}
        </p>
      </div>
      <Link
        href={upgradeHref(!!user)}
        className="shrink-0 rounded-lg bg-premium-600 px-4 py-2 text-sm font-semibold text-white hover:bg-premium-700 transition-colors"
      >
        Conhecer o Premium
      </Link>
    </div>
  );
}
