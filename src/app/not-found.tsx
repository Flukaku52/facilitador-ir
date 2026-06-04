import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-indigo-200 dark:text-indigo-900">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Página não encontrada</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">O conteúdo que você procura não existe ou foi removido.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
