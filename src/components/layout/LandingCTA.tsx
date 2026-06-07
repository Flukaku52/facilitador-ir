'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LandingCTA() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mt-8">
        <div className="mx-auto h-14 w-56 rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Continuar declaração →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <Link
          href="/questionario"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Começar diagnóstico gratuito
        </Link>
      </div>
      <p className="mt-3 text-sm text-gray-400 dark:text-gray-600">Leva cerca de 3 minutos. Sem cadastro.</p>
    </>
  );
}
