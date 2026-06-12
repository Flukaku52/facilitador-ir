import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-5xl font-bold text-primary-200 dark:text-primary-900">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h1>
      <p className="mt-2 text-muted">O conteúdo que você procura não existe ou foi removido.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
