'use client';

import { useRouter } from 'next/navigation';
import { clearAll } from '@/lib/storage/local-profile-storage';

export default function ErrorFallback() {
  const router = useRouter();

  function handleClear() {
    clearAll();
    router.push('/');
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
      <div className="text-5xl">⚠️</div>
      <h2 className="text-xl font-bold text-foreground">
        Algo deu errado ao carregar seus dados
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        Em alguns casos, uma atualização de página resolve o problema. Se o
        erro persistir, limpar os dados locais e recomeçar o diagnóstico vai
        restaurar o aplicativo. Se você tem uma conta, seus dados na nuvem
        permanecem seguros.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20"
        >
          Recarregar a página
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center justify-center rounded-lg bg-danger-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger-700 transition-colors"
        >
          Limpar dados e recomeçar
        </button>
      </div>
    </div>
  );
}
