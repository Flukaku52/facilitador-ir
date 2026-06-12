'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, startTransition } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { startTransition(() => setMounted(true)); }, []);

  if (!mounted) return <div className="w-28 h-8" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:text-gray-400 dark:hover:border-primary-600 dark:hover:text-primary-400"
    >
      <span className="text-base leading-none">{isDark ? '☀' : '☽'}</span>
      {isDark ? 'Tema claro' : 'Tema escuro'}
    </button>
  );
}
