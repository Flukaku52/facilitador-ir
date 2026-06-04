# IR Facilitador

**Assistente guiado de Imposto de Renda Pessoa Física para o Brasil.**

Versão atual: `MVP 0.1` | Stack: Next.js 16 + TypeScript + Tailwind CSS | Persistência: `localStorage`

---

## O que é o IR Facilitador

IR Facilitador é um aplicativo web que ajuda pessoas sem conhecimento tributário a **organizar, entender e preparar** sua Declaração de Imposto de Renda Pessoa Física (DIRPF) de forma simples e guiada.

O app **não transmite declarações à Receita Federal**, **não calcula imposto a pagar ou restituir** e **não substitui contador**. Ele funciona como um assistente de diagnóstico: descobre o perfil tributário do usuário, lista os documentos que precisam ser separados, explica onde e como declarar cada situação, e aponta os riscos antes que erros sejam cometidos.

---

## O que o app faz (MVP 0.1)

### 1. Diagnóstico tributário guiado

O app conduz o usuário por **26 perguntas de Sim/Não** organizadas em 5 blocos temáticos:

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

**Itens possíveis no checklist** (dependem do perfil):

- Informe de rendimentos da empresa (CLT)
- Informe de rendimentos do INSS
- Recibos de serviços autônomos e informes das empresas contratantes
- Recibos de aluguel recebidos e contrato de locação
- Comprovantes de carnê-leão (aluguel ou autônomo)
- Comprovantes de outras rendas
- Informes de rendimentos dos bancos
- Escritura / contrato do imóvel
- Contrato de financiamento e comprovantes de parcelas
- Documento do veículo (CRLV)
- Extratos de bens no exterior
- Informe de rendimentos da corretora
- Notas de corretagem de compras e vendas
- DARFs de renda variável pagos
- Posição e histórico de transações de criptoativos
- Informe de contribuições e saldo da previdência privada (PGBL/VGBL)
- Recibos e notas fiscais de despesas médicas
- Informe de pagamentos do plano de saúde
- Informe de pagamentos da instituição de ensino
- CPF e documentos dos dependentes
- Decisão judicial e comprovantes de pensão alimentícia

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

### 7. Relatório final copiável

Gera um resumo completo com:

- Perfil tributário identificado (todas as flags ativas)
- Nível de complexidade
- Lista de todos os documentos com status (concluído / pendente)
- Lista de pendências obrigatórias
- Todos os alertas com severidade
- Guias recomendados com links
- Próximos passos numerados
- Aviso legal obrigatório

Botão **"Copiar relatório"** gera texto plano estruturado e copia para a área de transferência.

### 8. Persistência entre sessões

Tudo que o usuário responde e marca fica salvo no `localStorage`. Ao recarregar a página, o estado é restaurado. Nenhum dado é enviado a servidores externos.

---

## Como usar

```
/ → Leia e clique em "Começar diagnóstico gratuito"
      ↓
/questionario → Responda as 26 perguntas (Sim / Não / Não sei)
      ↓ (salva automaticamente e redireciona)
/dashboard → Veja complexidade, pendências e alertas críticos
      ↓
/checklist → Marque os documentos conforme os reúne
/guias     → Leia as instruções de cada situação do seu perfil
/relatorio → Veja o resumo completo e copie
```

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

### Comandos

```bash
npm install        # Instalar dependências
npm run dev        # Servidor de desenvolvimento (Turbopack, porta 3000)
npm run build      # Build de produção
npm run lint       # ESLint
npx tsc --noEmit   # Verificação de tipos sem gerar arquivos
```

### Estrutura de diretórios

```
src/
├── app/
│   ├── layout.tsx                # Layout raiz: AppHeader + footer
│   ├── page.tsx                  # Landing page (/)
│   ├── not-found.tsx             # Página 404 global
│   ├── globals.css               # Tailwind base
│   ├── questionario/page.tsx     # Questionário (client)
│   ├── dashboard/page.tsx        # Painel pós-diagnóstico (client)
│   ├── checklist/page.tsx        # Checklist interativo (client)
│   ├── guias/
│   │   ├── page.tsx              # Lista de guias (client)
│   │   └── [slug]/page.tsx       # Detalhe do guia (SSG, 17 páginas)
│   └── relatorio/page.tsx        # Relatório final (client)
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx            # Variantes: primary / secondary / ghost / danger
│   │   ├── Badge.tsx             # Badge + ComplexityBadge especializado
│   │   ├── AlertBox.tsx          # Caixa info/warning/danger com ícone
│   │   ├── ProgressBar.tsx       # Barra de progresso acessível (role=progressbar)
│   │   └── Card.tsx              # Container com borda e sombra
│   ├── layout/
│   │   ├── AppHeader.tsx         # Cabeçalho fixo com links de navegação
│   │   └── LegalDisclaimer.tsx   # Aviso legal reutilizável
│   ├── questionnaire/
│   │   └── QuestionnaireFlow.tsx # Fluxo completo: perguntas → TaxProfile → redirect
│   ├── checklist/
│   │   ├── ChecklistGroup.tsx    # Seção de checklist por categoria
│   │   └── ChecklistItemRow.tsx  # Item individual com checkbox + link de guia
│   └── guides/
│       └── GuideCard.tsx         # Card clicável para listagem de guias
│
├── lib/
│   ├── data/
│   │   ├── questions.ts          # Array de 26 Questions com fieldPath e showWhen
│   │   └── guides.ts             # Array de 17 Guides + getGuideBySlug()
│   ├── rules/
│   │   └── tax-rules.ts          # Motor puro: 5 funções exportadas
│   └── storage/
│       └── local-profile-storage.ts  # CRUD em localStorage com guards de SSR
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

#### `ChecklistItem` — `src/types/checklist.ts`

```typescript
type ChecklistCategory =
  | 'income' | 'bank' | 'assets' | 'investments'
  | 'deductions' | 'complex_cases' | 'other';

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: ChecklistCategory;
  required: boolean;
  completed: boolean;
  relatedGuideSlug?: string;
}
```

#### `Guide` — `src/types/guide.ts`

```typescript
interface Guide {
  slug: string;
  title: string;
  shortDescription: string;
  category: ChecklistCategory;
  appliesTo: string[];              // Caminhos do TaxProfile que ativam o guia
  plainLanguageExplanation: string;
  documentsNeeded: string[];
  whereToDeclare: string;
  howToFill: string[];
  commonMistakes: string[];
  whenToCallAccountant?: string[];
  isAlert?: boolean;                // true = guia de caso complexo
}
```

#### `TaxAlert` — `src/types/alert.ts`

```typescript
type AlertSeverity = 'info' | 'warning' | 'danger';

interface TaxAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedGuideSlug?: string;
}
```

---

### Motor de regras — `src/lib/rules/tax-rules.ts`

Todas as funções são **puras** (sem efeitos colaterais, sem I/O, sem estado). Recebem `TaxProfile` e retornam dados derivados.

#### `classifyComplexity(profile): ComplexityLevel`

Avaliação em cascata — a primeira condição verdadeira vence:

```
COMPLEXO  → soldVariableIncome | hasCrypto | hasForeignAssets |
            hasRentIncome | hasSelfEmploymentIncome | hasAlimony | hasBusinessIncome

MÉDIO     → hasProperty | hasFinancedProperty | hasVehicle | hasDependents |
            hasPrivatePensionContributions | hasStocks | hasFiis |
            hasEtfs | hasFixedIncome | hasPensionOrRetirement

SIMPLES   → nenhum dos anteriores
```

#### `generateChecklist(profile): ChecklistItem[]`

Itera sobre cada seção do `TaxProfile`. Para cada flag `true`, empurra o(s) item(ns) correspondente(s) com `completed` inicializado pelo campo equivalente em `profile.documents`.

Máximo teórico: **21 itens** (perfil completamente preenchido com tudo `true`).

#### `getApplicableGuideSlugs(profile): string[]`

Para cada guia em `GUIDES`, verifica se algum caminho em `guide.appliesTo` tem valor `true` no profile via `getNestedValue()`.

#### `generateAlerts(profile): TaxAlert[]`

Avalia 7 condições independentes. Retorna entre 0 e 7 alertas dependendo do perfil.

#### `calculateChecklistProgress(items): number`

```
progress = round((itens_obrigatorios_concluídos / total_obrigatorios) × 100)
```
Retorna `0` se não há itens obrigatórios.

---

### Camada de storage — `src/lib/storage/local-profile-storage.ts`

Wrapper sobre `localStorage` com guards de SSR.

| Função | Chave | Tipo armazenado |
|--------|-------|-----------------|
| `saveTaxProfile` / `loadTaxProfile` | `ir_facilitador_profile` | `JSON<TaxProfile>` |
| `saveChecklistState` / `loadChecklistState` | `ir_facilitador_checklist` | `JSON<Record<string, boolean>>` |
| `clearAll` | ambas | — |

Todos os `load*` retornam `null` / `{}` como fallback seguro em caso de JSON inválido ou `localStorage` indisponível.

---

### Fluxo de dados completo

```
[Usuário responde perguntas]
         ↓
QuestionnaireFlow mantém QuestionAnswers em useState
         ↓
answersToProfile(answers) → TaxProfile
         ↓
classifyComplexity(profile) → profile.complexity
         ↓
saveTaxProfile(profile) → localStorage
         ↓
router.push('/dashboard')

[Páginas Dashboard / Checklist / Relatório]
         ↓
useEffect → loadTaxProfile() → TaxProfile | null
         ↓ (se null, mostra CTA para questionário)
generateChecklist(profile) → ChecklistItem[]
loadChecklistState() → aplica completed nos itens
generateAlerts(profile) → TaxAlert[]
getApplicableGuideSlugs(profile) → filtra GUIDES
         ↓
startTransition(() => setState(...)) → renderiza
```

---

### Rotas e modo de renderização

| Rota | Modo | Dados |
|------|------|-------|
| `/` | Static | Nenhum |
| `/questionario` | Client | Estado local (useState) |
| `/dashboard` | Client | localStorage no mount |
| `/checklist` | Client | localStorage no mount + escrita |
| `/guias` | Client | localStorage para filtrar guias |
| `/guias/[slug]` | SSG (17 páginas) | Dados estáticos em `guides.ts` |
| `/relatorio` | Client | localStorage no mount |
| `/_not-found` | Static | Nenhum |

**Total no build:** 26 páginas geradas.

---

### Decisões técnicas

**`localStorage` ao invés de Context ou Zustand**
Cada página lê no `useEffect` do mount. O custo é um flash inicial (resolvido com `state === null` antes de renderizar), mas o benefício é: zero boilerplate de provider, persistência automática entre navegações, e sem dependência de biblioteca de estado.

**`startTransition` nos efeitos**
O Next.js 16 com React 19 aplica a regra `react-hooks/set-state-in-effect` que bloqueia `setState` síncrono em efeitos. `startTransition` marca a atualização como não-urgente e satisfaz a regra sem mudar o comportamento percebido.

**Motor de regras como funções puras**
`tax-rules.ts` não importa React, browser APIs ou estado global. Pode ser testado unitariamente com Jest/Vitest sem necessidade de ambiente DOM.

**Guias como dados estáticos TypeScript**
Guias mudam no máximo uma vez por ano (calendário da Receita Federal). Dados estáticos permitem: tipagem completa, SSG em build time, zero latência de rede, e sem dependência de CMS.

**`suppressHydrationWarning` no `<body>`**
Extensões de browser (ex: Bitdefender) injetam atributos no `<body>` antes da hidratação React. `suppressHydrationWarning` instrui o React a ignorar divergências nesse elemento específico — não nos filhos.

---

### Limitações do MVP 0.1

| Limitação | Impacto | Versão planejada |
|-----------|---------|-----------------|
| Sem autenticação | Perfil existe apenas no browser local | v0.2 |
| Sem exportação PDF | Relatório só disponível em texto | v0.2 |
| Sem upload de documentos | Organização manual | v0.2 |
| Regras sem versionamento por ano-base | Risco de desatualização | v0.3 |
| Campos `hasBusinessIncome`, `hasEtfs`, `hasPrivatePension` sem perguntas | Sempre `false` | v0.2 |
| Sem testes automatizados | Risco em refatorações | v0.2 |
| Sem compartilhamento de relatório | Usuário precisa copiar manualmente | v0.2 |

---

## Aviso legal

Este aplicativo fornece orientação educacional e organização de informações para facilitar o preenchimento da declaração. Ele não substitui contador, advogado, a Receita Federal ou orientação profissional. A responsabilidade final pelas informações declaradas é do contribuinte. Nesta versão, as respostas ficam salvas apenas no navegador do usuário.
