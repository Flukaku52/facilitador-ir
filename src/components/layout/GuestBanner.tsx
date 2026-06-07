'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

// sessionStorage is safe here — this component is always imported with { ssr: false }
const DISMISSED_KEY = 'ir_guest_banner_dismissed';

export default function GuestBanner() {
  const { user, loading } = useAuth();
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem(DISMISSED_KEY),
  );

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  }

  // Hidden while auth loads, once user is logged in, or after dismissal
  if (loading || user || dismissed) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950">
      <p className="text-sm text-indigo-800 dark:text-indigo-300">
        Você está usando como convidado. Seus dados ficam só neste navegador.{' '}
        <Link
          href="/cadastro"
          className="font-medium underline underline-offset-2 hover:no-underline"
        >
          Criar conta para salvar na nuvem
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Fechar aviso de convidado"
        className="shrink-0 rounded p-0.5 text-indigo-500 hover:bg-indigo-100 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-900"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
