import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

export default function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
          <span className="text-xl font-bold">IR Facilitador</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Painel
            </Link>
            <Link href="/checklist" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Checklist
            </Link>
            <Link href="/guias" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Guias
            </Link>
            <Link href="/relatorio" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Relatório
            </Link>
          </nav>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
