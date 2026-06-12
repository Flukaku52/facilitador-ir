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
      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-indigo-300 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-600"
    >
      <span aria-hidden="true">🔒</span> Baixar PDF
    </Link>
  );
}
