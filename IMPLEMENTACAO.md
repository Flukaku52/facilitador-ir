# Guia de Implementação — IR Facilitador
## Como evoluir do MVP 0.1 até o app com automação completa

**Versão do documento:** 1.0
**Status:** Guia mestre de execução
**Para uso com:** Claude Code, Cursor, ou qualquer assistente de programação

---

## 1. Propósito Deste Documento

Este arquivo é o **mapa de execução** que conecta três documentos do projeto:

| Documento | Responde a pergunta |
|---|---|
| `README.md` | "O que existe hoje no app?" |
| `MELHORIAS.md` | "O que pode ser melhorado e em qual prioridade?" |
| `AUTOMACAO.md` | "Como construir a funcionalidade de automação?" |
| **`IMPLEMENTACAO.md` (este)** | **"Por onde começar, em qual ordem e o que NÃO mexer?"** |

Quando você (ou um assistente como Claude Code) for trabalhar no projeto, **comece sempre por este documento**. Ele dá o contexto necessário para entender que o app já existe, está funcional, e que o trabalho a partir daqui é de **evolução**, não de reescrita.

---

## 2. Estado Atual do Código (Ponto de Partida)

### O que já está pronto e funcionando

O IR Facilitador está no **MVP 0.1** com as seguintes capacidades:

- ✅ Questionário de 26 perguntas Sim/Não com lógica condicional
- ✅ Classificação automática de complexidade (Simples / Média / Complexa)
- ✅ Checklist personalizado de documentos
- ✅ 17 guias de preenchimento em linguagem simples
- ✅ Sistema de alertas de risco (info / warning / danger)
- ✅ Dashboard com resumo do diagnóstico
- ✅ Relatório final copiável
- ✅ Persistência em `localStorage` (browser local)

### Arquitetura central — o que torna a evolução possível

O design do MVP foi feito com três decisões que facilitam expansão:

**A. `TaxProfile` é o objeto central**
Toda a lógica do app deriva de um único objeto `TaxProfile`. Não importa como ele foi preenchido — manual, via IA, via Open Finance — o motor de regras, o checklist e os alertas funcionam da mesma forma.

**B. Motor de regras como funções puras**
`tax-rules.ts` não depende de React, browser ou estado global. Pode ser chamado de qualquer lugar — frontend, backend, scripts de migração — sempre com o mesmo comportamento.

**C. Camada de storage isolada**
`local-profile-storage.ts` é o único arquivo que toca `localStorage`. Trocar por Supabase, Firebase ou qualquer outro storage é mudar **um único arquivo**.

### Resumo da estrutura

```
src/
├── app/               # Rotas Next.js (UI)
├── components/        # Componentes React reutilizáveis
├── data/             # Dados estáticos (perguntas, guias)
├── lib/
│   ├── rules/        # Motor de regras (FUNÇÕES PURAS — não mexer estrutura)
│   └── storage/      # Camada de persistência (substituível)
└── types/            # Tipos TypeScript (extensível)
```

---

## 3. Princípios de Evolução

Estas são as **regras de ouro** do projeto. Qualquer alteração no código deve respeitá-las.

### 🟢 SEMPRE FAZER

1. **Estender o `TaxProfile`** com campos novos como **opcionais** (`campo?: tipo`). Nunca tornar campos existentes obrigatórios sem migração.

2. **Reaproveitar `tax-rules.ts`** chamando suas funções com o perfil preenchido por qualquer fonte. As regras já funcionam para qualquer `TaxProfile` válido.

3. **Adicionar rotas novas** quando criar funcionalidades (ex: `/importar`). Não substituir rotas existentes.

4. **Criar novos módulos em `src/lib/`** para cada nova integração (ex: `src/lib/ai/`, `src/lib/open-finance/`). Não misturar com módulos existentes.

5. **Testar antes de refatorar.** Se uma feature nova exigir mudança em código existente, escrever teste primeiro, refatorar depois.

### 🔴 NUNCA FAZER

1. **NÃO reescrever** `tax-rules.ts`. As funções estão estáveis. Estenda com novos arquivos no mesmo diretório se precisar de regras adicionais.

2. **NÃO remover** o questionário `/questionario`. Ele continua sendo um caminho válido de entrada — para usuários que preferem não conectar dados.

3. **NÃO mudar contratos** do `TaxProfile` que outras partes do app dependem. Campos existentes mantêm seus nomes e tipos.

4. **NÃO substituir o `localStorage`** por outro storage sem antes implementar autenticação + Supabase de forma completa (ver Fase 1 abaixo).

5. **NÃO mexer nos 17 guias** estáticos em `src/data/guides.ts` exceto para correções de conteúdo. A estrutura está validada.

6. **NÃO instalar bibliotecas pesadas** sem necessidade clara. Manter o bundle enxuto.

---

## 4. Mapa de Reaproveitamento

Esta tabela diz, para cada parte do código atual, o que deve acontecer com ela conforme as novas features forem chegando.

| Arquivo / Módulo | Ação | Quando |
|---|---|---|
| `src/types/tax-profile.ts` | **Estender** com campos opcionais | Fase 2 (IA) e Fase 3 (Open Finance) |
| `src/lib/rules/tax-rules.ts` | **Manter como está** — chamar com perfil de qualquer fonte | Permanente |
| `src/data/questions.ts` | **Adicionar** 3 perguntas faltantes (1.1) | Fase 0 |
| `src/data/guides.ts` | **Manter** — atualizar conteúdo anualmente | Permanente |
| `src/lib/storage/local-profile-storage.ts` | **Substituir** por wrapper que escolhe entre local e Supabase | Fase 1 |
| `src/app/questionario/page.tsx` | **Manter** — vira um dos caminhos de entrada | Permanente |
| `src/app/dashboard/page.tsx` | **Estender** para mostrar origem dos dados (manual / IA / banco) | Fase 4 |
| `src/app/checklist/page.tsx` | **Adicionar** filtros (2.4) | Fase 5 |
| `src/app/relatorio/page.tsx` | **Estender** com botão "Ir para gov.br" e PDF | Fase 1 e 4 |
| `src/app/importar/page.tsx` | **CRIAR** — nova rota para upload e Open Finance | Fase 2 e 3 |
| `src/lib/ai/` (diretório novo) | **CRIAR** — módulo de processamento de documentos | Fase 2 |
| `src/lib/open-finance/` (diretório novo) | **CRIAR** — módulo de integração bancária | Fase 3 |
| `src/lib/tax-years/` (diretório novo) | **CRIAR** — versionamento de regras por ano (1.5) | Fase 0 |

---

## 5. Roadmap de Execução

A ordem das fases não é arbitrária. Cada uma prepara o terreno para a próxima.

### 📋 Fase 0 — Estabilização da Base (1–2 semanas)

**Objetivo:** Deixar o MVP atual sólido antes de adicionar complexidade.

**Por que primeiro:** Você vai mexer no `TaxProfile` e nas regras. Sem testes e sem versionamento, qualquer mudança vira risco de regressão.

| # | Tarefa | Vem de | Critério de pronto |
|---|---|---|---|
| 0.1 | Adicionar 3 perguntas faltantes ao questionário | `MELHORIAS.md` 1.1 | `hasBusinessIncome`, `hasEtfs`, `hasPrivatePension` viram perguntas reais |
| 0.2 | Instalar Vitest e escrever testes para `tax-rules.ts` | `MELHORIAS.md` 1.3 | Cobertura mínima de 80% em `tax-rules.ts` |
| 0.3 | Criar estrutura `src/lib/tax-years/2025/` e migrar regras | `MELHORIAS.md` 1.5 | Regras chamadas a partir do ano-base, não direto do arquivo único |
| 0.4 | Criar páginas `/privacidade` e `/termos` | `MELHORIAS.md` 6.1 | Páginas acessíveis no footer |
| 0.5 | Adicionar botão "Limpar todos os dados" no dashboard | `MELHORIAS.md` 6.2 | Modal de confirmação + chamada `clearAll()` |
| 0.6 | Deploy no Vercel | `MELHORIAS.md` 8.2 | URL pública funcionando |

**Definition of done da Fase 0:** App estável em produção, com testes, versionamento de regras e documentação legal. Apto a receber mudanças sem medo.

---

### 🏗️ Fase 1 — Fundação para Automação (2–3 semanas)

**Objetivo:** Preparar a infraestrutura que as features de automação vão exigir.

**Por que antes da automação:** Open Finance e dados extraídos por IA são informações sensíveis. Não podem viver só no `localStorage`. Precisamos de autenticação e persistência na nuvem primeiro.

| # | Tarefa | Vem de | Critério de pronto |
|---|---|---|---|
| 1.1 | Configurar Supabase (banco + auth) | `MELHORIAS.md` 3.4 | Tabela `profiles` criada, auth funcionando |
| 1.2 | Implementar tela de login com Google + e-mail | `MELHORIAS.md` 3.4 | Usuário autentica e perfil é vinculado |
| 1.3 | Refatorar `local-profile-storage.ts` para wrapper que escolhe local/Supabase | — | Mesma interface, comportamento depende do estado de auth |
| 1.4 | Implementar `useSyncExternalStore` para storage | `MELHORIAS.md` 1.2 | Flicker eliminado, sem `startTransition` |
| 1.5 | Exportação PDF do relatório | `MELHORIAS.md` 3.1 | Botão funcional que gera PDF |
| 1.6 | Variáveis de ambiente tipadas | `MELHORIAS.md` 8.3 | `src/env.ts` validando em build |
| 1.7 | CI/CD com GitHub Actions | `MELHORIAS.md` 8.1 | Pipeline rodando em cada PR |

**Definition of done da Fase 1:** Usuário pode criar conta, ter dados salvos na nuvem, baixar relatório em PDF, e todo o app continua funcionando exatamente como antes para usuários não autenticados.

---

### 🤖 Fase 2 — Automação por IA (3–4 semanas)

**Objetivo:** Implementar o Pilar 1 do `AUTOMACAO.md` — leitura de PDFs com Claude API.

**Por que antes do Open Finance:** Menor complexidade técnica, não depende de credenciamento em fornecedores externos, e já entrega valor enorme ao usuário.

| # | Tarefa | Vem de | Critério de pronto |
|---|---|---|---|
| 2.1 | Estender `TaxProfile` com campos opcionais de valores e `dataSources` | `AUTOMACAO.md` §8 | Tipos novos sem quebrar contratos existentes |
| 2.2 | Criar `src/lib/ai/document-processor.ts` | `AUTOMACAO.md` §4 | Função `processDocument` testada com PDFs reais |
| 2.3 | Criar API Route `/api/ai/extract-document` (proxy seguro para Claude API) | — | Endpoint protegido, não expõe chave da API |
| 2.4 | Criar `src/lib/ai/document-to-profile.ts` | `AUTOMACAO.md` §5 | Função `applyDocumentToProfile` cobrindo todos os tipos |
| 2.5 | Criar componente `DocumentUploader` | `AUTOMACAO.md` §4 | Drag-and-drop funcional, estados visuais corretos |
| 2.6 | Criar página `/importar` (versão 1, só upload) | `AUTOMACAO.md` §7 | Página acessível, funcional, com link da landing |
| 2.7 | Atualizar landing para oferecer 2 caminhos: importar OU responder perguntas | — | Landing com dois CTAs claros |
| 2.8 | Testar com amostras reais de cada tipo de documento | — | ~20 PDFs testados, precisão acima de 85% |

**Definition of done da Fase 2:** Usuário pode arrastar informes em PDF, ver os dados extraídos sendo aplicados ao perfil, e usar o app normalmente a partir daí.

---

### 🏦 Fase 3 — Open Finance (3–4 semanas)

**Objetivo:** Implementar o Pilar 2 do `AUTOMACAO.md` — importação automática de dados bancários.

**Por que depois da IA:** Open Finance exige credenciamento, sandbox, validação de produção. Mais demorado e burocrático. Faz sentido provar valor antes.

| # | Tarefa | Vem de | Critério de pronto |
|---|---|---|---|
| 3.1 | Criar conta sandbox no Pluggy (ou Belvo) | `AUTOMACAO.md` §3 | Conta criada, sandbox funcionando |
| 3.2 | Criar `src/lib/open-finance/pluggy-client.ts` | `AUTOMACAO.md` §3 | Cliente configurado, OAuth funcionando |
| 3.3 | Implementar fluxo de conexão de banco com OAuth | `AUTOMACAO.md` §3 | Usuário conecta sandbox, retorna dados |
| 3.4 | Criar `normalize-open-finance.ts` | `AUTOMACAO.md` §3 | Dados Pluggy → patch para TaxProfile |
| 3.5 | Estender página `/importar` com seção de bancos conectados | `AUTOMACAO.md` §7 | UI para conectar/listar/desconectar instituições |
| 3.6 | Tela de consentimento LGPD antes da conexão | `AUTOMACAO.md` §9 | Modal com texto claro do que será acessado |
| 3.7 | Validação em produção (KYC no fornecedor) | — | Acesso a dados reais |

**Definition of done da Fase 3:** Usuário conecta seu banco real, dados de investimentos aparecem no perfil automaticamente, sem digitação.

---

### 🌉 Fase 4 — Ponte gov.br e Polimento (1–2 semanas)

**Objetivo:** Fechar o ciclo. O usuário sai do app pronto para enviar a declaração.

| # | Tarefa | Vem de | Critério de pronto |
|---|---|---|---|
| 4.1 | Criar componente `DeclarationReadyPanel` | `AUTOMACAO.md` §6 | Painel exibe checklist final e botão para gov.br |
| 4.2 | Adicionar seção "Origem dos dados" nas páginas de revisão | `AUTOMACAO.md` §5 | Cada campo mostra se veio de IA, banco ou manual |
| 4.3 | Atualizar relatório com seção "Como usar no gov.br" | `AUTOMACAO.md` §6 | Relatório explica passo a passo |
| 4.4 | Contador regressivo até o prazo da Receita | `MELHORIAS.md` 2.6 | Banner com dias restantes |
| 4.5 | Compartilhamento por link | `MELHORIAS.md` 2.8 | URL com perfil codificado funciona |

**Definition of done da Fase 4:** Jornada completa: usuário entra → importa dados → revisa → vai pro gov.br → envia. App pronto para lançamento público.

---

### ✨ Fase 5 — Melhorias Pós-MVP Completo (contínua)

A partir daqui, escolher melhorias do `MELHORIAS.md` por valor entregue ao usuário:

- **P2 mais impactantes:** filtros no checklist (2.4), skeleton loaders (2.3), edição de respostas (2.1), múltiplos anos (3.2), PWA (4.3)
- **P3 quando fizer sentido:** anotações (2.5), notificações por e-mail (3.5), OCR de imagens (3.7), modo contador (7.1)
- **Monetização:** plano premium (7.3), marketplace de contadores (7.2)

---

## 6. Regras de Coexistência

Quando um assistente de programação for implementar qualquer fase, estas instruções devem ser dadas explicitamente.

### Sobre o questionário manual

O questionário **NÃO É** legacy. Ele continua sendo:

- Caminho válido para quem não quer conectar dados
- Forma de complementar dados após importação automática (perguntas que dependem de contexto humano)
- Backup quando a IA não conseguir extrair algo

A página `/questionario` permanece, com o mesmo fluxo, e funciona em paralelo com `/importar`.

### Sobre o TaxProfile

Crescimento do tipo segue o padrão:

```typescript
// ❌ ERRADO — quebra contratos
interface TaxProfile {
  income: {
    hasCltIncome: boolean;
    cltGrossIncome: number; // novo campo obrigatório!
  };
}

// ✅ CERTO — campos novos sempre opcionais
interface TaxProfile {
  income: {
    hasCltIncome: boolean;
    cltGrossIncome?: number; // opcional
  };
}
```

Toda função que consome `TaxProfile` deve continuar funcionando mesmo se os campos novos estiverem `undefined`.

### Sobre as fontes de dados

Cada origem de dados tem seu próprio módulo isolado:

```
src/lib/
├── ai/              # tudo relacionado a processamento de documentos com IA
├── open-finance/    # tudo relacionado a Open Finance
└── rules/           # motor de regras (não mistura com fontes)
```

A regra é: **nenhum módulo de origem de dados pode importar outro**. Eles só compartilham o tipo `TaxProfile` e a interface de normalização.

### Sobre o storage

O storage tem **uma única interface** consumida pelo app:

```typescript
// src/lib/storage/profile-storage.ts (após Fase 1)

export async function loadProfile(): Promise<TaxProfile | null>;
export async function saveProfile(profile: TaxProfile): Promise<void>;
export async function clearAll(): Promise<void>;
```

Internamente, escolhe entre `localStorage` (anônimo) ou Supabase (autenticado). Mas o app **não sabe** qual é qual — só consome a interface.

---

## 7. Como Usar Este Documento com Claude Code

### Padrão de prompt recomendado

Quando for pedir ao Claude Code para implementar algo, sempre comece com este contexto:

```
Estou trabalhando no projeto IR Facilitador. O contexto completo está em três arquivos:

1. README.md — descreve o MVP 0.1 atual (já funcional)
2. AUTOMACAO.md — descreve a feature de automação que vou implementar
3. IMPLEMENTACAO.md — guia mestre de execução

Leia esses três arquivos antes de começar.

Tarefa específica: [implementar tarefa X.Y da Fase Z do IMPLEMENTACAO.md]

Regras importantes:
- NÃO reescreva código existente — apenas estenda
- Siga as "Regras de coexistência" do IMPLEMENTACAO.md
- Antes de mexer em algo, verifique no "Mapa de reaproveitamento" se aquele arquivo é "manter" ou "estender"
- Se tiver dúvida sobre alguma decisão, pergunte antes de implementar
```

### Padrão para encerrar uma tarefa

Ao final de cada tarefa, peça ao Claude Code para validar:

```
Antes de considerar pronto:

1. O código atualiza apenas o que estava planejado? (Não houve refator espontâneo?)
2. Todos os testes existentes ainda passam?
3. A interface pública dos módulos foi preservada?
4. Os novos campos no TaxProfile são opcionais?
5. O critério de "pronto" da tarefa no IMPLEMENTACAO.md foi atingido?

Se sim, gere um resumo do que foi feito. Se não, ajuste antes.
```

### Sinais de alerta durante o desenvolvimento

Se você ver o Claude Code (ou qualquer outro assistente) fazendo qualquer uma destas coisas, **pare e revise**:

- 🚨 Renomeando funções de `tax-rules.ts`
- 🚨 Removendo o questionário ou mudando sua estrutura
- 🚨 Tornando campos do `TaxProfile` obrigatórios
- 🚨 Reescrevendo guias estáticos
- 🚨 Instalando bibliotecas para resolver problemas que podem ser resolvidos com código próprio
- 🚨 Sugerindo "refatorar antes de implementar a feature"

Refatoração tem hora e lugar — quando ela aparece como solução para uma feature nova, geralmente é sinal de que o assistente está sobre-engenheirando.

---

## 8. Resumo Visual da Jornada

```
        ESTADO ATUAL                    ESTADO FINAL
        (MVP 0.1)                       (App v1.0)
        
   ┌──────────────────┐           ┌──────────────────────┐
   │  Questionário    │           │  Questionário        │  ← mantido
   │  manual          │   ───►    │  + Upload PDFs (IA)  │
   │  + Checklist     │           │  + Open Finance      │
   │  + Relatório     │           │  + Login na nuvem    │
   │  (localStorage)  │           │  + PDF + gov.br link │
   └──────────────────┘           └──────────────────────┘

           │                              ▲
           │                              │
           └──────────────┬───────────────┘
                          │
                ┌─────────┴─────────┐
                │  5 fases de       │
                │  evolução, sem    │
                │  reescrita        │
                └───────────────────┘

      Fase 0   →   Fase 1    →   Fase 2   →   Fase 3   →   Fase 4
  Estabilização  Fundação      IA (PDFs)   Open Finance  gov.br
  (2 semanas)   (3 semanas)   (4 semanas)  (4 semanas)  (2 semanas)
                                                              │
                                                              ▼
                                                       Fase 5 (contínua)
                                                       Melhorias P2/P3
```

---

## 9. Checklist Antes de Começar

Antes de abrir o Claude Code e implementar qualquer coisa, confirme:

- [ ] Li `README.md` e entendo a estrutura atual do código
- [ ] Li `MELHORIAS.md` e sei quais melhorias entram em cada fase
- [ ] Li `AUTOMACAO.md` e entendo a arquitetura da feature de automação
- [ ] Li este `IMPLEMENTACAO.md` e sei a ordem e as regras
- [ ] O código atual está commitado no Git (ponto de retorno seguro)
- [ ] Sei qual fase vou começar (provavelmente Fase 0)
- [ ] Tenho os critérios de "pronto" da tarefa em mente

Com isso preparado, qualquer assistente de programação tem contexto suficiente para evoluir o app sem quebrar nada.

---

## 10. Para Onde Ir a Partir Daqui

**Hoje:** Você está aqui — MVP 0.1 funcional, com este guia em mãos.

**Próximo passo concreto:** Começar a Fase 0, tarefa 0.1 — adicionar as 3 perguntas faltantes no questionário (descrita em `MELHORIAS.md` 1.1).

**Por que essa tarefa primeiro:** É a menor possível, mexe num arquivo só (`src/data/questions.ts`), tem critério de pronto óbvio, e te dá confiança de que está navegando bem o projeto antes de coisas maiores.

Boa jornada! 🚀
