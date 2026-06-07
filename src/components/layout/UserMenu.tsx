'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

function getInitials(user: User): string {
  const name = user.user_metadata?.name as string | undefined;
  if (name?.trim()) return name.trim().charAt(0).toUpperCase();
  return (user.email ?? '?').charAt(0).toUpperCase();
}

function getDisplayName(user: User): string {
  const name = user.user_metadata?.name as string | undefined;
  return name?.trim() || user.email || '';
}

export default function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setOpen(false);
    router.push('/');
  }

  // Skeleton while auth initializes (only when Supabase is configured)
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        Entrar
      </Link>
    );
  }

  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Menu do usuário — ${displayName}`}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-56 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {/* User info row — display only */}
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">Logado como</p>
            <p className="mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
              {displayName}
            </p>
          </div>

          <div className="p-1">
            <Link
              href="/conta"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Minha conta
            </Link>

            <button
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors dark:text-red-400 dark:hover:bg-red-950"
            >
              {signingOut ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
