# IR Facilitador

**Assistente guiado de Imposto de Renda Pessoa Física para o Brasil.**

Versão atual: `0.2` | Stack: Next.js 16 + TypeScript + Tailwind CSS | Persistência: `localStorage` | Deploy: Vercel

🔗 **Produção:** https://ir-facilitador.vercel.app

---

## O que é o IR Facilitador

IR Facilitador é um aplicativo web que ajuda pessoas sem conhecimento tributário a **organizar, entender e preparar** sua Declaração de Imposto de Renda Pessoa Física (DIRPF) de forma simples e guiada.

O app **não transmite declarações à Receita Federal**, **não calcula imposto a pagar ou restituir** e **não substitui contador**. Ele funciona como um assistente de diagnóstico: descobre o perfil tributário do usuário, lista os documentos que precisam ser separados, explica onde e como declarar cada situação, e aponta os riscos antes que erros sejam cometidos.

---

## O que o app faz (v0.2)

### 1. Diagnóstico tributário guiado

O app conduz o usuário por **30 perguntas de Sim/Não** organizadas em 5 blocos temáticos:

| Bloco | Perguntas | O que mapeia |
|-------|-----------|--------------|
| Renda | 5 | CLT, INSS, autônomo, aluguel, outras rendas |
| Bancos e Investimentos | 8 | Bancos, corretoras, renda fixa, ações, FIIs, cripto, exterior |
| Bens | 3 | Imóvel, financiamento, veículo |
| Despesas e Deduções | 6 | Dependentes, médico, educação, previdência, pensão |
| Documentos | 4 | Confirmação de quais informes já foram obtidos |

**Lógica `showWhen`:** perguntas condicionais só aparecem quando a resposta anterior é relevante. Exemplo: "O imóvel é financiado?" só surge se o usuário disse que tem imóvel.

### 2. Classificação de complexidade

Ao final do questionário, o motor de regras classifica automaticamente:

| Nível | Critério |
|-------|----------|
| **Simples** | CLT, bancos, despesas comuns — sem venda de ativos, sem aluguel, sem exterior |
| **Média** | Imóvel, veículo, dependentes, previdência privada, investimentos sem venda |
| **Complexa** | Venda de renda variável, criptoativos, aluguel recebido, exterior, autônomo, pensão judicial |

Declarações complexas não são bloqueadas — o app continua ajudando, exibindo recomendação de revisão profissional.

### 3. Checklist personalizado de documentos

Gerado automaticamente com base no perfil. Cada item:

- É marcável como concluído (checkbox persistido em `localStorage`)
- Tem descrição de onde obtê-lo
- Tem link direto para o guia relacionado
- É classificado como **obrigatório** ou **opcional**
- Agrupa-se em 6 categorias: Renda, Bancos, Bens, Investimentos, Despesas, Casos Complexos
- Pode ser filtrado por: Todos / Pendentes / Concluídos

### 4. Guias de preenchimento (17 guias)

Cada guia contém: explicação em linguagem simples, documentos necessários, onde declarar no programa, como preencher passo a passo, erros comuns a evitar, e quando chamar um contador.

| Slug | Título | Categoria |
|------|--------|-----------|
| `clt-informe-rendimentos` | Trabalho com carteira assinada (CLT) | Renda |
| `aposentadoria-pensao` | Aposentadoria, pensão e INSS | Renda |
| `contas-bancarias` | Contas bancárias | Bancos |
| `investimentos-renda-fixa` | Investimentos de renda fixa | Investimentos |
| `corretora-investimentos` | Conta em corretora | Investimentos |
| `despesas-medicas` | Despesas médicas e plano de saúde | Deduções |
| `despesas-educacao` | Despesas com educação | Deduções |
| `dependentes` | Dependentes | Deduções |
| `imovel-proprio` | Imóvel próprio | Bens |
| `imovel-financiado` | Imóvel financiado | Bens |
| `veiculo` | Veículo | Bens |
| `previdencia-privada` | Previdência privada (PGBL e VGBL) | Investimentos |
| `acoes-fiis-alerta` | Ações e FIIs — requer atenção | Casos complexos |
| `cripto-alerta` | Criptoativos — requer atenção | Casos complexos |
| `aluguel-recebido-alerta` | Aluguel recebido — requer atenção | Casos complexos |
| `exterior-alerta` | Bens e rendimentos no exterior — requer atenção | Casos complexos |
| `autonomo-freelancer-alerta` | Autônomo e freelancer — requer atenção | Casos complexos |

### 5. Alertas de risco automáticos

O motor de regras gera alertas com três níveis de severidade:

| ID | Severidade | Gatilho |
|----|-----------|---------|
| `alert_medical_no_receipts` | `warning` | Despesas médicas declaradas + sem recibos disponíveis |
| `alert_financed_property` | `info` | Imóvel financiado presente no perfil |
| `alert_variable_income` | `danger` | Venda de renda variável confirmada |
| `alert_crypto` | `danger` | Criptoativos presentes no perfil |
| `alert_rent` | `warning` | Aluguel recebido confirmado |
| `alert_foreign` | `danger` | Bens no exterior confirmados |
| `alert_self_employment` | `warning` | Renda autônoma confirmada |

### 6. Painel (Dashboard)

Após o questionário, o usuário acessa um painel que exibe:

- Badge de complexidade (Simples / Média / Complexa) com descrição contextual
- Cards com totais: documentos no checklist, pendências, alertas
- Barra de progresso do checklist
- Alertas críticos (`danger`) destacados
- Atalhos para Checklist, Guias e Relatório
- Link para editar respostas sem refazer o questionário
- Botão flutuante "Tirar dúvida" com assistente IA
- Botão para limpar todos os dados

### 7. Edição de respostas (`/questionario/editar`)

O usuário pode corrigir qualquer resposta sem refazer o questionário inteiro:

- Lista todas as perguntas agrupadas por seção
- Toggle Sim/Não por item, com resposta atual destacada
- Salva imediatamente e volta ao painel

### 8. Assistente IA (Claude API)

Botão flutuante "Tirar dúvida" disponível no painel:

- Modal com campo de pergunta livre
- Resposta gerada pela Claude API com contexto do perfil tributário do usuário
- Orientação educacional com aviso legal obrigatório
- Requer `ANTHROPIC_API_KEY` no `.env.local` (retorna 503 sem a chave)

### 9. Relatório final copiável e imprimível

Gera um resumo completo com:

- Perfil tributário identificado (todas as flags ativas)
- Nível de complexidade
- Lista de todos os documentos com status (concluído / pendente)
- Lista de pendências obrigatórias
- Todos os alertas com severidade
- Guias recomendados com links
- Próximos passos numerados
- Aviso legal obrigatório

Botões: **"Copiar relatório"** (texto plano) · **"Compartilhar link"** (URL com perfil em base64) · **"Imprimir / PDF"** (`window.print()`).

### 10. Persistência entre sessões

Tudo que o usuário responde e marca fica salvo no `localStorage`. Ao recarregar a página, o estado é restaurado. Nenhum dado é enviado a servidores externos (exceto perguntas ao assistente IA, se configurado).

---

## Como usar

```
/ → Leia e clique em "Começar diagnóstico gratuito"
      ↓
/questionario → Responda as 30 perguntas (Sim / Não / Não sei)
      ↓ (salva automaticamente e redireciona)
/dashboard → Veja complexidade, pendências e alertas críticos
      ↓
/checklist         → Marque os documentos conforme os reúne
/guias             → Leia as instruções de cada situação do seu perfil
/relatorio         → Veja o resumo completo, copie ou imprima
/questionario/editar → Corrija qualquer resposta sem refazer tudo
```

---

## Configuração local

### Pré-requisitos

- Node.js 20+
- npm 10+

### Instalar e rodar

```bash
git clone <repo>
cd ir-facilitador
npm install
npm run dev       # http://localhost:3000
```

### Assistente IA (opcional)

Para ativar o botão "Tirar dúvida" com Claude:

```bash
cp .env.local.example .env.local
# Edite .env.local e adicione sua chave:
# ANTHROPIC_API_KEY=sk-ant-...
```

Obtenha a chave em [console.anthropic.com](https://console.anthropic.com). Sem a chave, o assistente retorna erro 503 — o restante do app funciona normalmente.

---

## Documentação Técnica

### Stack

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Next.js | 16.2.7 | Framework com App Router + SSG |
| React | 19 | UI com Server e Client Components |
| TypeScript | 5 | Tipagem estática |
| Tailwind CSS | 4 | Utilitários de estilo |
| Geist | — | Fonte tipográfica |
| `@anthropic-ai/sdk` | ^0.30 | Claude API (assistente IA, server-side) |
| `next-themes` | — | Dark mode persistido |

### Comandos

```bash
npm install        # Instalar dependências
npm run dev        # Servidor de desenvolvimento (Turbopack, porta 3000)
npm run build      # Build de produção
npm run lint       # ESLint
npx tsc --noEmit   # Verificação de tipos sem gerar arquivos
vercel --prod      # Deploy para produção (requer Vercel CLI)
```

### Estrutura de diretórios

```
src/
├── app/
│   ├── layout.tsx                     # Layout raiz: AppHeader + footer
│   ├── page.tsx                       # Landing page (/)
│   ├── not-found.tsx                  # Página 404 global
│   ├── globals.css                    # Tailwind base
│   ├── api/
│   │   └── ask/route.ts               # POST /api/ask — Claude API (server-only)
│   ├── questionario/
│   │   ├── page.tsx                   # Questionário (client)
│   │   └── editar/page.tsx            # Edição de respostas (client)
│   ├── dashboard/page.tsx             # Painel pós-diagnóstico (client)
│   ├── checklist/page.tsx             # Checklist interativo (client)
│   ├── guias/
│   │   ├── page.tsx                   # Lista de guias (client)
│   │   └── [slug]/page.tsx            # Detalhe do guia (SSG, 17 páginas)
│   ├── relatorio/page.tsx             # Relatório final (client)
│   ├── privacidade/page.tsx           # Política de privacidade
│   └── termos/page.tsx                # Termos de uso
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx                 # Variantes: primary / secondary / ghost / danger
│   │   ├── Badge.tsx                  # Badge + ComplexityBadge especializado
│   │   ├── AlertBox.tsx               # Caixa info/warning/danger com ícone
│   │   ├── ProgressBar.tsx            # Barra de progresso acessível (role=progressbar)
│   │   ├── Card.tsx                   # Container com borda e sombra
│   │   ├── Toast.tsx                  # Notificação temporária "Salvo automaticamente"
│   │   ├── Skeleton.tsx               # Skeletons de loading por página
│   │   └── AskDialog.tsx             # Modal flutuante do assistente IA
│   ├── layout/
│   │   ├── AppHeader.tsx              # Cabeçalho fixo com links de navegação
│   │   ├── LegalDisclaimer.tsx        # Aviso legal reutilizável
│   │   ├── ThemeProvider.tsx          # Wrapper do next-themes
│   │   ├── ThemeToggle.tsx            # Botão de alternância claro/escuro
│   │   ├── DeadlineBanner.tsx         # Banner com contagem regressiva até o prazo
│   │   └── ClearDataModal.tsx         # Modal de confirmação para limpar dados
│   ├── questionnaire/
│   │   └── QuestionnaireFlow.tsx      # Fluxo completo: perguntas → TaxProfile → redirect
│   ├── checklist/
│   │   ├── ChecklistGroup.tsx         # Seção de checklist por categoria
│   │   └── ChecklistItemRow.tsx       # Item individual com checkbox + link de guia
│   └── guides/
│       └── GuideCard.tsx              # Card clicável para listagem de guias
│
├── lib/
│   ├── data/
│   │   ├── questions.ts               # Array de 30 Questions com fieldPath e showWhen
│   │   └── guides.ts                  # Array de 17 Guides + getGuideBySlug()
│   ├── hooks/
│   │   ├── useStoredProfile.ts        # useSyncExternalStore para TaxProfile no localStorage
│   │   └── useChecklistStore.ts       # useSyncExternalStore para estado do checklist
│   ├── rules/
│   │   └── tax-rules.ts              # Motor puro: 5 funções exportadas
│   ├── storage/
│   │   └── local-profile-storage.ts  # CRUD em localStorage com guards de SSR
│   └── tax-years/                    # Limiares por ano-base
│       ├── 2025/thresholds.ts
│       ├── 2026/thresholds.ts
│       └── index.ts
│
└── types/
    ├── tax-profile.ts     # TaxProfile, ComplexityLevel, createEmptyProfile()
    ├── question.ts        # Question, QuestionAnswers
    ├── checklist.ts       # ChecklistItem, ChecklistCategory, CATEGORY_LABELS
    ├── guide.ts           # Guide
    ├── alert.ts           # TaxAlert, AlertSeverity
    └── report.ts          # TaxReport
```

---

### Modelos de dados

#### `TaxProfile` — `src/types/tax-profile.ts`

Objeto central. Criado ao final do questionário, persistido em `localStorage`.

```typescript
interface TaxProfile {
  id: string;       // crypto.randomUUID()
  taxYear: number;  // getFullYear() - 1

  income: {
    hasCltIncome: boolean;              // Emprego CLT
    hasBusinessIncome: boolean;         // Renda empresarial (campo reservado)
    hasSelfEmploymentIncome: boolean;   // Autônomo / freelancer
    hasRentIncome: boolean;             // Aluguel recebido
    hasPensionOrRetirement: boolean;    // INSS / aposentadoria
    hasOtherIncome: boolean;            // Outras rendas
  };

  assets: {
    hasBankAccounts: boolean;       // Contas bancárias
    hasInvestments: boolean;        // Conta em corretora / aplicações
    hasProperty: boolean;           // Imóvel próprio
    hasFinancedProperty: boolean;   // Imóvel financiado
    hasVehicle: boolean;            // Veículo
    hasCrypto: boolean;             // Criptoativos
    hasForeignAssets: boolean;      // Bens / contas no exterior
  };

  investments: {
    hasFixedIncome: boolean;       // CDB, Tesouro, LCI, LCA, fundos
    hasStocks: boolean;            // Ações
    hasFiis: boolean;              // FIIs
    hasEtfs: boolean;              // ETFs (campo reservado)
    hasPrivatePension: boolean;    // PGBL/VGBL (campo reservado)
    soldVariableIncome: boolean;   // Vendeu ativos de renda variável
  };

  deductions: {
    hasDependents: boolean;                    // Dependentes
    hasMedicalExpenses: boolean;               // Despesas médicas
    hasEducationExpenses: boolean;             // Escola / faculdade / curso técnico
    hasPrivatePensionContributions: boolean;   // Contribuições PGBL/VGBL
    hasAlimony: boolean;                       // Pensão alimentícia judicial
  };

  documents: {
    hasCltIncomeReport: boolean;    // Informe da empresa já obtido
    hasBankReports: boolean;        // Informes dos bancos já obtidos
    hasBrokerReports: boolean;      // Informe da corretora já obtido
    hasMedicalReceipts: boolean;    // Recibos médicos disponíveis
    hasPropertyDocuments: boolean;  // Documentos do imóvel disponíveis
  };

  complexity?: ComplexityLevel;  // Calculado por classifyComplexity()
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

#### `Question` — `src/types/question.ts`

```typescript
interface Question {
  id: string;
  title: string;
  description?: string;
  type: 'boolean';
  section: 'income' | 'assets' | 'investments' | 'deductions' | 'documents';
  sectionLabel: string;     // Legível (ex: "Renda")
  fieldPath: string;        // Dot-notation para TaxProfile (ex: "income.hasCltIncome")
  showWhen?: {
    fieldPath: string;      // Campo do TaxProfile a verificar
    equals: boolean;        // Valor esperado para exibir a pergunta
  };
}

type QuestionAnswers = Record<string, boolean>; // fieldPath → resposta
```

---

### Motor de regras — `src/lib/rules/tax-rules.ts`

Todas as funções são **puras** (sem efeitos colaterais, sem I/O, sem estado). Recebem `TaxProfile` e retornam dados derivados.

#### `classifyComplexity(profile): ComplexityLevel`

```
COMPLEXO  → soldVariableIncome | hasCrypto | hasForeignAssets |
            hasRentIncome | hasSelfEmploymentIncome | hasAlimony | hasBusinessIncome

MÉDIO     → hasProperty | hasFinancedProperty | hasVehicle | hasDependents |
            hasPrivatePensionContributions | hasStocks | hasFiis |
            hasEtfs | hasFixedIncome | hasPensionOrRetirement

SIMPLES   → nenhum dos anteriores
```

#### `generateChecklist(profile): ChecklistItem[]`

Itera sobre cada seção do `TaxProfile`. Para cada flag `true`, empurra o(s) item(ns) correspondente(s). Máximo teórico: **21 itens**.

#### `getApplicableGuideSlugs(profile): string[]`

Para cada guia em `GUIDES`, verifica se algum caminho em `guide.appliesTo` tem valor `true` no profile.

#### `generateAlerts(profile): TaxAlert[]`

Avalia 7 condições independentes. Retorna entre 0 e 7 alertas.

#### `calculateChecklistProgress(items): number`

```
progress = round((itens_obrigatorios_concluídos / total_obrigatorios) × 100)
```

---

### Camada de storage — `src/lib/storage/local-profile-storage.ts`

| Função | Chave | Tipo armazenado |
|--------|-------|-----------------|
| `saveTaxProfile` / `loadTaxProfile` | `ir_facilitador_profile` | `JSON<TaxProfile>` |
| `saveChecklistStateMap` / `loadChecklistState` | `ir_facilitador_checklist` | `JSON<Record<string, boolean>>` |
| `clearAll` | ambas | — |

Todos os `load*` retornam `null` / `{}` como fallback seguro. `save*` dispara `window.dispatchEvent(new StorageEvent('storage'))` para notificar os hooks reativos na mesma aba.

### Hooks reativos — `src/lib/hooks/`

```typescript
// Lê TaxProfile do localStorage com snapshot cacheado
useStoredProfile(): TaxProfile | null

// Lê estado do checklist com snapshot cacheado
useChecklistStore(): Record<string, boolean>
```

Ambos usam `useSyncExternalStore` com:
- `subscribe`: escuta evento `storage` no `window`
- `getSnapshot`: lê `localStorage`, cacheia o objeto parseado enquanto a string bruta não muda (garantia de referência estável exigida pelo React 18)
- `getServerSnapshot`: retorna `null` / `{}` para SSR

### API Route — `src/app/api/ask/route.ts`

```
POST /api/ask
Body: { question: string, profile: TaxProfile | null }
Response: { answer: string } | { error: string }
```

- Servidor Node.js (não exposta ao client bundle)
- Requer `ANTHROPIC_API_KEY` em variável de ambiente
- Retorna 503 se a chave não estiver configurada
- Usa `claude-sonnet-4-6` com `max_tokens: 1024`
- Sistema inclui o perfil serializado como contexto

---

### Rotas e modo de renderização

| Rota | Modo | Dados |
|------|------|-------|
| `/` | Static | Nenhum |
| `/questionario` | Client | Estado local (useState) |
| `/questionario/editar` | Client | localStorage (useSyncExternalStore) |
| `/dashboard` | Client | localStorage (useSyncExternalStore) |
| `/checklist` | Client | localStorage (useSyncExternalStore + escrita) |
| `/guias` | Client | localStorage para filtrar guias |
| `/guias/[slug]` | SSG (17 páginas) | Dados estáticos em `guides.ts` |
| `/relatorio` | Client | localStorage + searchParams |
| `/privacidade` | Static | Nenhum |
| `/termos` | Static | Nenhum |
| `/api/ask` | Dynamic (server) | Claude API |
| `/_not-found` | Static | Nenhum |

**Total no build:** 30 páginas geradas.

---

### Decisões técnicas

**`useSyncExternalStore` para localStorage**
É a API correta do React 18 para fontes de dados externas (localStorage incluído). Elimina o flash inicial do padrão `useEffect + setState`. Os snapshots são cacheados por string bruta: `JSON.parse` só é chamado quando o conteúdo do `localStorage` realmente muda, garantindo referência estável entre chamadas consecutivas (requisito do React 18 para evitar loops de re-render).

**Motor de regras como funções puras**
`tax-rules.ts` não importa React, browser APIs ou estado global. Pode ser testado unitariamente sem necessidade de ambiente DOM.

**Guias como dados estáticos TypeScript**
Guias mudam no máximo uma vez por ano. Dados estáticos permitem: tipagem completa, SSG em build time, zero latência de rede, sem dependência de CMS.

**API Route para Claude API**
A chave `ANTHROPIC_API_KEY` nunca é exposta ao cliente — toda comunicação com a API da Anthropic passa pela rota server-side `/api/ask`. O cliente só faz `fetch('/api/ask', { method: 'POST', ... })`.

**`suppressHydrationWarning` no `<body>`**
Extensões de browser injetam atributos no `<body>` antes da hidratação React. `suppressHydrationWarning` instrui o React a ignorar divergências nesse elemento — não nos filhos.

---

### Limitações da v0.2

| Limitação | Impacto | Versão planejada |
|-----------|---------|-----------------|
| Sem autenticação | Perfil existe apenas no browser local | v0.3 |
| Sem exportação PDF nativa | Relatório via `window.print()` apenas | v0.3 |
| Sem upload de documentos | Organização manual | v0.3 |
| Regras sem versionamento de limites numéricos | Thresholds por ano-base definidos mas sem uso nas regras | v0.3 |
| Campos `hasBusinessIncome`, `hasEtfs`, `hasPrivatePension` sem perguntas | Sempre `false` | v0.3 |
| Sem testes automatizados | Risco em refatorações | v0.3 |
| Assistente IA requer chave manual | Não funciona sem `ANTHROPIC_API_KEY` | — |

---

## Aviso legal

Este aplicativo fornece orientação educacional e organização de informações para facilitar o preenchimento da declaração. Ele não substitui contador, advogado, a Receita Federal ou orientação profissional. A responsabilidade final pelas informações declaradas é do contribuinte. Nesta versão, as respostas ficam salvas apenas no navegador do usuário.
