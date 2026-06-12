import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function AppHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <span className="text-xl font-bold">IR Facilitador</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-4 text-sm text-body">
            <Link
              href="/dashboard"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Painel
            </Link>
            <Link
              href="/checklist"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Checklist
            </Link>
            <Link
              href="/guias"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Guias
            </Link>
            <Link
              href="/relatorio"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
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
