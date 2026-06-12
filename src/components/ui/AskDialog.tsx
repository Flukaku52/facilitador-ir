'use client';

import { useState, useRef, useEffect } from 'react';
import { TaxProfile } from '@/types/tax-profile';
import { MAX_QUESTION_LENGTH } from '@/lib/rate-limit/ask-rate-limit';

interface AskDialogProps {
  profile: TaxProfile | null;
}

export default function AskDialog({ profile }: AskDialogProps) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) handleClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer('');
    setError('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), profile }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (res.status === 429) {
        throw new Error('Você atingiu o limite de perguntas por enquanto. Tente novamente mais tarde.');
      }
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido');
      setAnswer(data.answer ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar sua pergunta.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setQuestion('');
    setAnswer('');
    setError('');
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-700 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
        aria-label="Tirar dúvida com assistente IA"
      >
        <span aria-hidden>🤖</span>
        <span className="hidden sm:inline">Tirar dúvida</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Assistente IR"
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <div>
                <h2 className="font-semibold text-foreground">Assistente IR</h2>
                <p className="text-xs text-muted">Powered by Claude</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Disclaimer */}
              <p className="text-xs text-premium-800 dark:text-premium-200 bg-premium-50 dark:bg-premium-950 border border-premium-200 dark:border-premium-800 rounded-lg px-3 py-2">
                ⚠️ Este assistente pode ajudar a interpretar suas respostas, mas pode cometer erros. Não use as respostas como orientação fiscal definitiva. Em caso de dúvida, confirme com um contador ou com a Receita Federal.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ex: Preciso declarar o aluguel que recebi? Como funciona a isenção na venda de ações?"
                    rows={3}
                    maxLength={MAX_QUESTION_LENGTH}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 resize-none"
                    disabled={loading}
                  />
                  <span className={`absolute bottom-2 right-2 text-xs ${question.length >= MAX_QUESTION_LENGTH ? 'text-danger-500' : 'text-gray-400'}`}>
                    {question.length}/{MAX_QUESTION_LENGTH}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Consultando...
                    </span>
                  ) : (
                    'Perguntar'
                  )}
                </button>
              </form>

              {/* Error */}
              {error && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
                  {error}
                </p>
              )}

              {/* Answer */}
              {answer && (
                <div className="rounded-lg border border-border bg-gray-50 px-4 py-3 dark:bg-gray-800 max-h-64 overflow-y-auto">
                  <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-2">Resposta</p>
                  <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
