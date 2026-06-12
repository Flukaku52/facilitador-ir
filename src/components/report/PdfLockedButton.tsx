"use client";

import Link from "next/link";
import { upgradeHref } from "@/components/premium/UpgradeCta";

// Substitui o botão de download de PDF para não-premium: mesmo visual, leva ao upgrade.
export default function PdfLockedButton({
  isLoggedIn,
}: {
  isLoggedIn: boolean;
}) {
  return (
    <Link
      href={upgradeHref(isLoggedIn)}
      title="Disponível no acesso premium"
      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-body hover:border-primary-300 transition-colors dark:hover:border-primary-600"
    >
      <span aria-hidden="true">🔒</span> Baixar PDF
    </Link>
  );
}
