import LegalDisclaimer from "@/components/layout/LegalDisclaimer";
import LandingCTA from "@/components/layout/LandingCTA";

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      {/* 1. HERO */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Declare seu Imposto de Renda sem medo de cair na malha
        </h1>
        <p className="mt-5 text-lg text-body">
          Responda algumas perguntas e receba um checklist personalizado dos
          seus documentos, com guias em linguagem simples — pra você não errar
          no que importa.
        </p>
        <LandingCTA />
      </div>

      {/* 2. COMO FUNCIONA */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight text-foreground">
          Como funciona
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Responda o questionário",
              desc: "Perguntas de sim/não sobre sua vida financeira. Sem juridiquês.",
            },
            {
              step: "2",
              title: "Receba seu checklist",
              desc: "A lista exata dos documentos que você precisa, baseada nas suas respostas.",
            },
            {
              step: "3",
              title: "Siga os guias",
              desc: "Passo a passo de como declarar cada item, em linguagem de gente.",
            },
          ].map(({ step, title, desc }) => (
            <div
              key={step}
              className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                {step}
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PROPOSTA DE VALOR */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Não trava no programa da Receita",
            desc: "Guias mostram onde clicar e o que preencher em cada tela.",
          },
          {
            title: "Não esquece documento",
            desc: "O checklist marca o que você já separou e o que falta.",
          },
          {
            title: "Sabe quando precisa de ajuda",
            desc: "Se seu caso é complexo, o app avisa e indica procurar um contador.",
          },
        ].map(({ title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      {/* 4. PRAZO — informativo, sem escassez */}
      <div className="mt-10 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-sm text-body">
          <strong className="text-foreground">
            A declaração de 2026 vai de março a 31 de maio.
          </strong>{" "}
          Quem se organiza antes não corre no fim do prazo.
        </p>
      </div>

      {/* SLOT PROVA SOCIAL — preencher quando houver dado real */}
      {/*
      <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        <p className="text-2xl font-bold text-foreground">X declarações organizadas</p>
        <p className="mt-1 text-sm text-muted">Depoimento real aqui.</p>
      </div>
      */}

      {/* 5. LIMITAÇÕES — uma frase */}
      <p className="mt-10 text-center text-sm text-muted">
        O IR Facilitador organiza e orienta — não transmite a declaração nem
        substitui um contador. É pra você fazer com segurança o que já faria
        sozinho.
      </p>

      {/* 6. CTA FINAL */}
      <div className="mt-10 text-center">
        <LandingCTA />
      </div>

      <div className="mt-8">
        <LegalDisclaimer />
      </div>
    </div>
  );
}
