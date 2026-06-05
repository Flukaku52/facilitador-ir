'use client';

import { useState } from 'react';
import { clearAll } from '@/lib/storage/local-profile-storage';
import Button from '@/components/ui/Button';

export default function ClearDataModal() {
  const [open, setOpen] = useState(false);

  function handleClear() {
    clearAll();
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-500 hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
      >
        Limpar todos os dados
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 id="clear-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Limpar todos os dados?
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Isso apaga seu diagnóstico, checklist e progresso salvos neste navegador. Essa ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="danger" fullWidth onClick={handleClear}>
                Sim, apagar tudo
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
