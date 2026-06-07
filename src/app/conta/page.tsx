'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { clearAll } from '@/lib/storage/local-profile-storage';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Change password inline form
// ---------------------------------------------------------------------------
function ChangePasswordForm({ onCancel }: { onCancel: () => void }) {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
        <span>Senha alterada com sucesso.</span>
        <button onClick={onCancel} className="underline underline-offset-2">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Nova senha
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Confirmar nova senha
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="Repita a nova senha"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {submitting ? 'Salvando...' : 'Salvar nova senha'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Delete account — double-confirmation modal
// ---------------------------------------------------------------------------
type DeleteStep = 'intent' | 'confirm';

function DeleteModal({
  onClose,
  onConfirm,
  deleting,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}) {
  const [step, setStep] = useState<DeleteStep>('intent');
  const [typed, setTyped] = useState('');

  if (step === 'intent') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal
          aria-labelledby="delete-title-1"
          className="relative z-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        >
          <h2
            id="delete-title-1"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            Excluir conta?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Todos os seus dados salvos na nuvem serão removidos permanentemente. Esta ação não pode
            ser desfeita.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Continuar
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="delete-title-2"
        className="relative z-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900"
      >
        <h2
          id="delete-title-2"
          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
        >
          Confirmação final
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Para confirmar, digite{' '}
          <strong className="text-gray-900 dark:text-gray-100">excluir</strong> no campo abaixo.
        </p>
        <input
          type="text"
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder="excluir"
        />
        <div className="mt-4 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={typed !== 'excluir' || deleting}
            className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
          >
            {deleting ? 'Excluindo...' : 'Excluir minha conta'}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ContaPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="h-8 w-48 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
      </div>
    );
  }

  const memberSince = user.created_at ? formatDate(user.created_at) : '—';

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Erro ao excluir conta.');
      }
      clearAll();
      await signOut();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir conta.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Minha conta</h1>

      {/* User info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 space-y-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">E-mail</p>
          <p className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Membro desde</p>
          <p className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">{memberSince}</p>
        </div>
      </div>

      {/* Password */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Senha</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Altere sua senha de acesso</p>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            >
              Alterar senha
            </button>
          )}
        </div>
        {showPasswordForm && <ChangePasswordForm onCancel={() => setShowPasswordForm(false)} />}
      </div>

      {/* Danger zone */}
      <div className="mt-4 rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-900">
        <p className="font-medium text-gray-900 dark:text-gray-100">Zona de risco</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Ações irreversíveis. Proceda com cuidado.
        </p>
        {deleteError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {deleteError}
          </p>
        )}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="mt-4 text-sm font-medium text-red-600 underline-offset-2 hover:underline hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Excluir conta permanentemente
        </button>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          deleting={deleting}
        />
      )}
    </div>
  );
}
