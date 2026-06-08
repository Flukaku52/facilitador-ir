# Melhorias e Roadmap — IR Facilitador

Este documento cataloga todas as melhorias identificadas para o IR Facilitador, organizadas por categoria e prioridade. Serve como backlog técnico e produto para o desenvolvimento após o MVP.

**Legenda de prioridade:**
- `P1` — Alta prioridade: impacto direto na qualidade percebida ou na confiabilidade
- `P2` — Média prioridade: melhora significativa sem ser bloqueante
- `P3` — Baixa prioridade: nice-to-have, futura exploração

**Status:**
- ✅ Implementado
- 🔄 Parcialmente implementado
- ⬜ Pendente

---

## Itens implementados (v0.1 → v0.2)

| # | Melhoria | Versão |
|---|----------|--------|
| 1.1 | Pergunta `q_has_pension_plan` adicionada (campo `investments.hasPrivatePension`) | sprint fundação |
| 1.2 | `useSyncExternalStore` para localStorage (snapshot cacheado) | v0.1 → v0.2 fix |
| 1.3 | Vitest + 64 testes no motor de regras (cobertura 98,75%) | sprint fundação |
| 1.4 | Error Boundaries em 5 páginas (`ErrorBoundary` + `ErrorFallback`) | sprint fundação |
| 1.5 | `taxYear` em todas as funções de `tax-rules.ts`; thresholds 2025/2026 distintos | sprint fundação |
| 2.1 | Edição de respostas sem reiniciar (`/questionario/editar`) | v0.2 |
| 2.2 | Toast de salvamento automático | v0.1 polimento |
| 2.3 | Skeleton loaders por página | v0.1 polimento |
| 2.4 | Filtros no checklist (Todos / Pendentes / Concluídos) | v0.1 polimento |
| 2.6 | DeadlineBanner com contagem regressiva até o prazo | v0.1 polimento |
| 2.8 | Compartilhamento do relatório por link (`?d=base64`) | v0.1 polimento |
| 3.1 | Imprimir/PDF via `window.print()` | v0.1 polimento |
| 3.6 | Assistente IA com Claude API (`/api/ask` + `AskDialog`) | v0.2 |
| 4.1 | `useMemo` para todos os dados derivados | v0.1 polimento |
| 4.3 | PWA parcial: `manifest.json` com ícone e metadados | v0.1 polimento |
| 5.1 | Navegação por teclado no questionário (S/N/←) | v0.1 polimento |
| 5.2 | `aria-live` para leitores de tela | v0.1 polimento |
| 6.1 | Páginas `/privacidade` e `/termos` | v0.1 polimento |
| 6.2 | Botão "Limpar todos os dados" com modal de confirmação | v0.1 polimento |
| 8.2 | Deploy no Vercel com URL de produção | v0.2 |
| 8.1 | CI/CD com GitHub Actions (lint + tsc + vitest + build) | sprint fundação |
| 8.3 | `@t3-oss/env-nextjs` + Zod para env vars tipadas (`src/env.ts`) | sprint fundação |
| 3.1 | PDF nativo com `@react-pdf/renderer` (T6 Sprint 1) | sprint 1 |
| 3.4 | Autenticação Supabase + sincronização na nuvem (T1–T5 Sprint 1) | sprint 1 |

---

## 1. Correções e dívida técnica

### 1.1 Campos sem perguntas no questionário `P1` ✅

**Problema:** Os campos `income.hasBusinessIncome`, `investments.hasEtfs` e `investments.hasPrivatePension` existem no tipo `TaxProfile` mas nunca são perguntados. Estão sempre `false`.

**Solução implementada:** Adicionada pergunta `q_has_pension_plan` para `investments.hasPrivatePension`. Os campos `hasBusinessIncome` e `hasEtfs` já haviam sido cobertos em v0.2. Total: 29 perguntas.

---

### 1.2 Snapshot estável em `useSyncExternalStore` ✅

**Problema:** `JSON.parse` retornava novo objeto a cada chamada de `getSnapshot`, causando re-renders em loop no React 18 e crashes em páginas como checklist/guias/relatório.

**Solução implementada:** Cache por string bruta — `JSON.parse` só é chamado quando o conteúdo do `localStorage` realmente muda. A referência do objeto retornado permanece estável entre chamadas consecutivas.

---

### 1.3 Testes unitários para o motor de regras `P1` ✅

**Problema:** `tax-rules.ts` contém toda a lógica de negócio e não tem nenhum teste.

**Solução implementada:** Vitest instalado; `src/lib/rules/tax-rules.test.ts` com 64 casos cobrindo todas as funções públicas. Cobertura: 98,75% de linhas (threshold: 85%).

```bash
npm install -D vitest @vitest/coverage-v8
```

Casos prioritários:
- `classifyComplexity`: perfil simples → `simple`; criptoativos → `complex`; imóvel sem venda → `medium`
- `generateChecklist`: cada flag gera o(s) item(ns) correspondente(s)
- `generateAlerts`: despesas médicas sem recibo gera warning; perfil limpo não gera alertas
- `calculateChecklistProgress`: 0 itens → 0%; todos concluídos → 100%

---

### 1.4 Error Boundaries nas páginas client-side `P2` ✅

**Problema:** Se o `localStorage` contiver JSON corrompido e o fallback falhar, a página quebra sem mensagem útil ao usuário.

**Solução:** Criar `ErrorBoundary` e envolver páginas que leem `localStorage`:

```tsx
// src/components/layout/ErrorBoundary.tsx
'use client';
import { Component, ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
```

---

### 1.5 Versionamento de regras tributárias por ano-base `P1` ✅

**Solução implementada:** Todas as 4 funções públicas de `tax-rules.ts` aceitam `taxYear: number` opcional (padrão: `getCurrentTaxYear()`). Thresholds distintos para 2025 e 2026. Todas as páginas passam `profile.taxYear` explicitamente.

---

### 1.6 Validar thresholds de 2026 com fonte oficial `P1` ✅

Valores IRPF 2026 confirmados com fonte oficial da Receita Federal. Limite de educação, dependente, desconto simplificado e prazo de entrega já estão corrigidos no código.

Campos corrigidos em `src/lib/tax-years/2026/thresholds.ts`:
- `EDUCATION_DEDUCTION_LIMIT_PER_PERSON` = R$ 3.561,50 — confirmado (P&R IRPF 2026, versão 23/04/2026)
- `DEPENDENT_ANNUAL_DEDUCTION` = R$ 2.275,08 — confirmado (mesmos limites IRPF 2025, sem alteração legislativa)
- `SIMPLIFIED_DEDUCTION_LIMIT` = R$ 16.754,34 — confirmado (mesmos limites IRPF 2025, sem alteração legislativa)
- `FILING_DEADLINE` = 2026-05-29 — confirmado (Instrução Normativa de abertura do IRPF 2026)

---

## 2. UX e Interface

### 2.1 Edição de respostas sem reiniciar ✅

Implementado em `/questionario/editar`. Lista todas as perguntas com toggle Sim/Não, salva e volta ao painel.

---

### 2.2 Toast de salvamento automático ✅

Componente `Toast` exibe "Salvo automaticamente" após cada marcação no checklist.

---

### 2.3 Skeleton loaders ✅

Componentes `DashboardSkeleton`, `ChecklistSkeleton`, `GuidesSkeleton`, `ReportSkeleton` em `src/components/ui/Skeleton.tsx`.

---

### 2.4 Filtros no checklist ✅

Filtros Todos / Pendentes / Concluídos com contagens em tempo real.

---

### 2.5 Anotações pessoais nos itens do checklist `P3` ⬜

**Problema:** O usuário pode querer registrar onde guardou o documento.

**Solução:** Campo de texto livre em cada item, salvo no `localStorage`. Exibido como expansão do item.

---

### 2.6 Contador regressivo até o prazo ✅

`DeadlineBanner` calcula dias restantes até o prazo com base em `getTaxYearThresholds(getCurrentTaxYear()).FILING_DEADLINE`. Some automaticamente após o prazo encerrado.

---

### 2.7 Modo de impressão para guias `P3` ⬜

**Solução:** Adicionar `@media print` styles que ocultam header, footer e botões nos guias individuais.

---

### 2.8 Compartilhamento do relatório por link ✅

URL `/relatorio?d=<base64>` com o `TaxProfile` codificado. Ao acessar com o parâmetro, o app lê da URL em vez do `localStorage`. Banner informativo para visualizações compartilhadas.

**Limitação conhecida:** o link codifica apenas o `TaxProfile`. Os toggles explícitos do checklist (`ir_facilitador_checklist`) não são transmitidos. Em modo shared view, apenas os itens auto-marcados pelo perfil (via `profile.documents`) aparecem como concluídos. Isso é esperado — o destinatário vê o estado do diagnóstico, não os toggles manuais.

---

## 3. Novas funcionalidades

### 3.1 Exportação do relatório em PDF `P1` ✅

**Status:** PDF nativo com `@react-pdf/renderer` v4.5.1 implementado (Sprint 1 T6). Botão "Baixar PDF" em `/relatorio` gera arquivo `relatorio-ir-{ano}.pdf` 100% client-side. `window.print()` mantido como "Imprimir".

---

### 3.2 Múltiplos perfis / anos de declaração `P2` ⬜

**Solução:** Trocar o modelo de armazenamento de único profile para array indexado por `taxYear`:

```typescript
type ProfilesStore = Record<number, TaxProfile>; // taxYear → profile
```

---

### 3.3 Upload e organização de documentos `P2` ⬜

Requer Supabase Storage. Cada `ChecklistItem` passaria a ter `attachmentUrl?: string`.

---

### 3.4 Autenticação e persistência na nuvem `P1` ✅ (Sprint 1)

Supabase Auth (email/senha ou Google OAuth) + migração do `localStorage` para PostgreSQL.

Schema sugerido:
```sql
CREATE TABLE tax_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tax_year integer NOT NULL,
  profile jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tax_year)
);

CREATE TABLE checklist_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES tax_profiles ON DELETE CASCADE,
  item_id text NOT NULL,
  completed boolean DEFAULT false,
  note text,
  UNIQUE(profile_id, item_id)
);
```

---

### 3.5 Notificações de prazo por e-mail `P3` ⬜

Pós-autenticação. Lembretes via Resend ou SendGrid (Supabase Edge Functions): 30 dias, 7 dias, 1 dia antes do prazo.

---

### 3.6 Integração com IA (Claude API) ✅

Implementado:
- `POST /api/ask` — rota server-side com `@anthropic-ai/sdk`, modelo `claude-sonnet-4-6`
- `AskDialog` — botão flutuante no painel, modal com campo de pergunta livre
- Perfil do usuário enviado como contexto no system prompt
- Retorna 503 sem `ANTHROPIC_API_KEY`; restante do app funciona normalmente

---

### 3.7 OCR de informes de rendimentos `P3` ⬜

Claude API multimodal para extrair campos de informes em PDF/imagem. Todos os valores extraídos marcados como "precisa de conferência".

---

### 3.8 Comparação entre anos-base `P3` ⬜

Tela side-by-side com dois anos após implementação de múltiplos perfis.

---

## 4. Performance

### 4.1 Memoização de dados derivados ✅

`useMemo` em todas as páginas para `generateChecklist`, `generateAlerts`, `getApplicableGuideSlugs` e `calculateChecklistProgress`.

---

### 4.2 Lazy loading dos guias `P3` ⬜

Já eficiente — `getApplicableGuideSlugs` filtra antes de renderizar. Nenhuma melhoria necessária no MVP.

---

### 4.3 Progressive Web App (PWA) `P2` 🔄

`manifest.json` com metadados e ícone. Service worker (via `next-pwa`) e cache offline ainda não implementados.

---

## 5. Acessibilidade

### 5.1 Navegação por teclado no questionário ✅

`S`/`1` = Sim · `N`/`2` = Não · `?`/`3` = Não sei · `←` = Voltar. Implementado com `useCallback` + `document.addEventListener('keydown')`.

---

### 5.2 `aria-live` para leitores de tela ✅

Dois elementos com `aria-live="polite"` e `className="sr-only"`: um anuncia a resposta dada, outro anuncia o texto da próxima pergunta.

---

### 5.3 Verificação de contraste de cores `P2` ✅

`text-indigo-400` → `text-indigo-600 dark:text-indigo-400` em ✓ e • decorativos (`page.tsx`, `guias/[slug]/page.tsx`). `text-gray-400` → `text-gray-500 dark:text-gray-400` no símbolo ○ do checklist no relatório. Demais usos de `gray-400` são ícones interativos com hover coberto.

---

### 5.4 Focus management entre perguntas `P2` ✅

`useRef` + `useEffect` em `QuestionnaireFlow.tsx`: ao avançar pergunta, foco vai automaticamente para o card da pergunta (`tabIndex=-1`, `focus:outline-none`).

---

## 6. Segurança e privacidade

### 6.1 Política de privacidade e termos de uso ✅

Páginas `/privacidade` e `/termos` implementadas e linkadas no footer.

---

### 6.2 Botão "Limpar todos os dados" ✅

`ClearDataModal` no painel: modal de confirmação → `clearAll()` → redirect para `/`.

---

### 6.3 Aviso de dados sensíveis no relatório compartilhado `P2` ✅

Modal de confirmação inline em `/relatorio` antes de gerar link (`?d=base64`). Texto: "Este link pode conter informações pessoais do seu perfil fiscal. Compartilhe apenas com pessoas de confiança." Botões: Cancelar / Gerar link mesmo assim.

---

### 6.4 Mensagem de link compartilhado inválido `P2` ✅

Quando `/relatorio?d=...` recebe base64 inválido, corrompido ou malformado, exibe mensagem amigável: "Este link de relatório parece inválido ou expirado. Peça para a pessoa gerar um novo link." Antes exibia a mensagem genérica de "diagnóstico não concluído", que era confusa.

---

### 6.5 Acessibilidade do modal de compartilhamento `P2` ✅

Modal já tinha `role="dialog"`, `aria-modal`, `aria-labelledby` e fechamento por clique externo. Adicionado: fechamento por tecla Escape e foco inicial no botão Cancelar ao abrir.

---

## 7. Produto e monetização (longo prazo)

### 7.1 Modo contador `P3` ⬜

Interface para contadores gerenciarem múltiplos clientes. Requer auth com role `accountant`.

---

### 7.2 Marketplace de revisão profissional `P3` ⬜

Conexão usuário ↔ contador parceiro para revisão de declarações complexas.

---

### 7.3 Plano premium `P3` ⬜

Versão gratuita (funcionalidades atuais) vs paga (histórico multi-ano, upload, notificações).

---

## 8. Infraestrutura e DevOps

### 8.1 CI/CD com GitHub Actions `P2` ✅

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
```

---

### 8.2 Deploy no Vercel ✅

Produção em https://ir-facilitador.vercel.app. Deploy via `vercel --prod`.

Para ativar o assistente IA em produção:
```
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

---

### 8.3 Variáveis de ambiente tipadas `P2` ✅

[`@t3-oss/env-nextjs`](https://env.t3.gg/) para validar `ANTHROPIC_API_KEY` (e futuramente `SUPABASE_*`) em build time:

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
});
```

---

### 9.1 Chaves de localStorage: hífen vs underscore `P2` 🔄

**Auditoria de código concluída (beta-polish-safety-work):** 6 pontos de uso confirmados — todos usam underscore: `ir_facilitador_profile` e `ir_facilitador_checklist` em `local-profile-storage.ts`, `useStoredProfile.ts`, `useChecklistStore.ts` e `useProfileSync.ts`. Chave com hífen nunca apareceu em nenhum arquivo versionado.

**Pendência única:** verificar via DevTools em produção (`Object.keys(localStorage)`) numa conta real ou de teste para confirmar que nenhum dado antigo usa chave com hífen. Se não aparecer, fechar como ✅ sem código.

---

### 9.3 Testar magic link manualmente `P2` ⬜

Magic link não pôde ser testado na Tarefa 3 por rate limit do Supabase. O `AuthHandler` implementado (hash flow) deve cobrir esse cenário, mas o teste manual está pendente.

**Ação:** quando rate limit resetar, testar o fluxo completo: Supabase Authentication → Send magic link → clicar no e-mail → verificar que hash é limpo da URL e redirect ocorre para `/dashboard`.

---

### 9.2 Feedback de dados corrompidos no localStorage `P2` ✅

`useStoredProfile` captura erros de `JSON.parse` e retorna `null` — comportamento intencional para estabilidade do `useSyncExternalStore`. Porém o usuário não recebe feedback: o app simplesmente mostra "Você ainda não concluiu o diagnóstico" sem explicar que os dados anteriores foram perdidos.

**Solução proposta (Opção A):** Expor flag `wasCorrupted` no hook via variável externa, e exibir um toast "Seus dados anteriores não puderam ser carregados" quando `wasCorrupted === true`. Não altera o contrato de `getSnapshot`.

O `ErrorBoundary` atual não cobre esse cenário — ele captura apenas exceções de render, não erros de storage pré-render.

---

### 9.4 Validação defensiva do shape do perfil no localStorage `P2` ✅

`loadTaxProfile()` e `getSnapshot()` (em `useStoredProfile`) agora rejeitam valores claramente inválidos do JSON (`null` literal, array, primitivo) antes de fazer cast para `TaxProfile`. Perfis antigos com campos ausentes continuam funcionando — apenas o shape mínimo (objeto não-null, não-array) é exigido. 9 testes cobrem os casos de borda em `local-profile-storage.test.ts`.

---

## Resumo de prioridades — pendentes

### P1 — Antes do próximo release

| # | Melhoria |
|---|----------|
| ~~1.6~~ | ~~Validar valores em `2026/thresholds.ts` com fonte oficial~~ ✅ Corrigido com fonte oficial (P&R IRPF 2026) |
| ~~3.4~~ | ~~Autenticação + persistência na nuvem~~ ✅ Sprint 1 |

### P2 — Próxima versão

| # | Melhoria |
|---|----------|
| 2.5 | Anotações no checklist |
| ~~3.1~~ | ~~PDF nativo com `@react-pdf/renderer`~~ ✅ Sprint 1 |
| 3.2 | Múltiplos perfis / anos |
| 3.3 | Upload de documentos |
| 4.3 | Service worker / cache offline (PWA completo) |
| ~~5.3~~ | ~~Verificação de contraste~~ ✅ indigo-400→600 e gray-400→500 corrigidos |
| ~~5.4~~ | ~~Focus management entre perguntas~~ ✅ QuestionnaireFlow |
| ~~6.3~~ | ~~Aviso de dados no compartilhamento~~ ✅ Modal de confirmação no relatório |
| 9.1 | Chave localStorage: auditoria de código concluída — risco baixo; confirmar via DevTools em produção |
| ~~9.2~~ | ~~Toast "dados corrompidos"~~ ✅ |
| ~~6.4~~ | ~~Mensagem de link compartilhado inválido~~ ✅ |
| ~~6.5~~ | ~~Acessibilidade do modal de compartilhamento (Escape + foco inicial)~~ ✅ |
| ~~9.4~~ | ~~Validação defensiva de shape no localStorage~~ ✅ 9 testes |
| ~~9.5~~ | ~~Toast falso de dados removidos para perfil válido~~ ✅ isProfileActuallyInvalid guard |
| ~~9.6~~ | ~~Progresso intermediário do questionário~~ ✅ saveDraft/loadDraft/clearDraft |

### P3 — Exploração futura

| # | Melhoria |
|---|----------|
| 2.7 | Modo de impressão para guias |
| 3.5 | Notificações de prazo por e-mail |
| 3.7 | OCR de informes |
| 3.8 | Comparação entre anos |
| 7.1 | Modo contador |
| 7.2 | Marketplace de revisão |
| 7.3 | Plano premium |
