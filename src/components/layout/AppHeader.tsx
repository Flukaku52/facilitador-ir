import Link from 'next/link';

export default function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
          <span className="text-xl font-bold">IR Facilitador</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Painel
          </Link>
          <Link href="/checklist" className="hover:text-indigo-600 transition-colors">
            Checklist
          </Link>
          <Link href="/guias" className="hover:text-indigo-600 transition-colors">
            Guias
          </Link>
          <Link href="/relatorio" className="hover:text-indigo-600 transition-colors">
            Relatório
          </Link>
        </nav>
      </div>
    </header>
  );
}
