'use client';

import { useState } from 'react';
import type { TaxProfile } from '@/types/tax-profile';

type Props = {
  open: boolean;
  cloudProfile: TaxProfile | null;
  onMigrate: () => Promise<void>;
  onDiscard: () => Promise<void>;
  onCancel: () => void;
};

export default function MigrationModal({ open, cloudProfile, onMigrate, onDiscard, onCancel }: Props) {
  const [submitting, setSubmitting] = useState<'migrate' | 'discard' | null>(null);

  if (!open) return null;

  async function handleMigrate() {
    setSubmitting('migrate');
    await onMigrate();
    setSubmitting(null);
  }

  async function handleDiscard() {
    setSubmitting('discard');
    await onDiscard();
    setSubmitting(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="migration-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
      >
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2
            id="migration-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Dados encontrados em dois lugares
          </h2>
        </div>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Você tem um diagnóstico salvo neste dispositivo e{' '}
          {cloudProfile ? 'também dados salvos na sua conta.' : 'ainda não tem dados na sua conta.'}
          {' '}O que você prefere fazer?
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={handleMigrate}
            disabled={submitting !== null}
            className="flex w-full flex-col rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-left hover:bg-indigo-100 disabled:opacity-60 transition-colors dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-900"
          >
            <span className="font-medium text-indigo-800 dark:text-indigo-200">
              {submitting === 'migrate' ? 'Migrando...' : 'Migrar dados deste dispositivo para a nuvem'}
            </span>
            <span className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400">
              Seu diagnóstico atual fica salvo na conta. {cloudProfile ? 'Os dados anteriores da conta serão substituídos.' : ''}
            </span>
          </button>

          {cloudProfile && (
            <button
              onClick={handleDiscard}
              disabled={submitting !== null}
              className="flex w-full flex-col rounded-lg border border-gray-200 bg-gray-50 p-3 text-left hover:bg-gray-100 disabled:opacity-60 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {submitting === 'discard' ? 'Carregando...' : 'Usar dados da conta (descartar os deste dispositivo)'}
              </span>
              <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                O diagnóstico salvo na conta substitui o que está neste dispositivo.
              </span>
            </button>
          )}

          <button
            onClick={onCancel}
            disabled={submitting !== null}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Decidir depois
          </button>
        </div>
      </div>
    </div>
  );
}
