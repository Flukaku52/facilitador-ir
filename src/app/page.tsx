import LegalDisclaimer from '@/components/layout/LegalDisclaimer';
import LandingCTA from '@/components/layout/LandingCTA';

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Imposto de Renda sem linguagem complicada.
        </h1>
        <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
          Responda perguntas simples e receba um checklist personalizado com os documentos que
          você precisa separar, os pontos que exigem atenção e um guia prático para organizar sua
          declaração.
        </p>
        <LandingCTA />
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {[
          { step: '1', title: 'Responda as perguntas', desc: 'Perguntas simples, sem juridiquês. Sim ou Não.' },
          { step: '2', title: 'Receba seu checklist', desc: 'Lista personalizada dos documentos que você precisa separar.' },
          { step: '3', title: 'Leia os guias', desc: 'Instruções práticas para cada parte da sua declaração.' },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-lg dark:bg-primary-950 dark:text-primary-400">
              {step}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-3">O app cobre situações como:</h2>
        <ul className="grid gap-1 sm:grid-cols-2 text-sm text-gray-600 dark:text-gray-400">
          {[
            'Trabalho CLT e informe de rendimentos',
            'Aposentadoria e pensão do INSS',
            'Contas bancárias e investimentos',
            'Imóvel próprio ou financiado',
            'Despesas médicas e plano de saúde',
            'Dependentes na declaração',
            'Previdência privada (PGBL/VGBL)',
            'Ações, FIIs e criptoativos',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="text-primary-600 dark:text-primary-400">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 rounded-xl border border-premium-100 bg-premium-50 p-6 dark:border-premium-900 dark:bg-premium-950">
        <h2 className="font-semibold text-premium-900 mb-3 dark:text-premium-100">O que o app não faz</h2>
        <ul className="space-y-1.5 text-sm text-premium-800 dark:text-premium-200">
          {[
            'Não envia sua declaração à Receita Federal.',
            'Não calcula imposto a pagar ou restituição exata.',
            'Não substitui orientação de contador ou advogado tributarista.',
            'Não acessa, lê ou importa seus documentos diretamente.',
            'Não garante isenção, deduções ou resultados fiscais específicos.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-premium-500">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10">
        <LegalDisclaimer />
      </div>
    </div>
  );
}
