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

---

## Apêndice A — Auditoria técnica: suporte a múltiplos anos-base e perfis

> Gerado em: overnight-deep-work · Branch: `overnight-deep-work`
> Objetivo: documentar impactos e estratégia de migração **sem implementar**. Nenhum código funcional é alterado aqui.

---

### A.1 Estado atual do TaxProfile

```typescript
// src/types/tax-profile.ts
export interface TaxProfile {
  id: string;          // UUID gerado no cliente (crypto.randomUUID())
  taxYear: number;     // Ano-base (calendário), ex.: 2025 para declaração 2026
  // … demais campos de renda, deduções, bens etc.
}

export function createEmptyProfile(): TaxProfile {
  return {
    id: crypto.randomUUID(),
    taxYear: new Date().getFullYear() - 1,  // padrão: ano anterior ao atual
    // …
  };
}
```

**Limitações do modelo atual:**
- Uma única chave `ir_facilitador_profile` no localStorage — sobrescreve ao trocar de ano.
- O `id` é um UUID do cliente; não há relação explícita entre anos do mesmo usuário.
- Ao fazer login em dispositivos diferentes, `useProfileSync` sincroniza apenas o perfil do `taxYear` corrente (derivado de `localProfile?.taxYear ?? getCurrentTaxYear()`).

---

### A.2 Onde `taxYear` é usado hoje

| Arquivo | Uso |
|---------|-----|
| `src/types/tax-profile.ts:5` | Campo `taxYear: number` na interface |
| `src/types/tax-profile.ts:61` | `createEmptyProfile` → `getFullYear() - 1` |
| `src/lib/tax-years/index.ts` | `getTaxYearThresholds(taxYear)` — tabela de limiares por ano |
| `src/lib/rules/tax-rules.ts` | Todas as 4 funções públicas recebem `taxYear` opcional |
| `src/lib/utils/profile-answers.ts:36` | `classifyComplexity(profile, profile.taxYear)` ao salvar respostas |
| `src/lib/storage/cloud-profile-storage.ts` | Coluna `tax_year` no Supabase; SELECT/UPSERT/DELETE filtram por `taxYear` |
| `src/lib/hooks/useProfileSync.ts` | Derivação de `taxYear` para queries de nuvem; fallback para `getCurrentTaxYear()` |
| `src/app/dashboard/page.tsx`, `checklist/page.tsx`, `guias/page.tsx`, `relatorio/page.tsx` | `profile.taxYear` passado explicitamente para funções de regras |
| `src/components/report/ReportPDF.tsx`, `DownloadPDFButton.tsx` | Nome do arquivo PDF e título do documento |

**Conclusão:** `taxYear` já é um cidadão de primeira classe — o motor de regras e o Supabase são multi-ano por design. O gargalo é o **armazenamento local** (uma chave flat) e o **fluxo de navegação** (sem seletor de ano).

---

### A.3 Impacto em localStorage

**Estado atual:** três chaves flat por perfil ativo.

```
ir_facilitador_profile          → TaxProfile (JSON)
ir_facilitador_checklist        → Record<itemId, boolean>
ir_facilitador_checklist_notes  → Record<itemId, string>
```

**Modelo proposto:** chaves indexadas por `taxYear`.

```
ir_facilitador_profile_{taxYear}          → TaxProfile
ir_facilitador_checklist_{taxYear}        → Record<itemId, boolean>
ir_facilitador_checklist_notes_{taxYear}  → Record<itemId, string>
ir_facilitador_active_tax_year            → number (ano selecionado)
ir_facilitador_known_tax_years            → number[] (anos disponíveis)
```

**Riscos de migração:**
1. Chaves antigas sem sufixo são ignoradas pelo novo código → usuário perde dados sem aviso se não houver migração one-shot.
2. Chave `ir_migration_v1_handled` já existe como marcador; precisaria de `ir_migration_v2_handled` para a migração de chaves.
3. `localStorage` em mobile tem limite de ~5 MB; múltiplos anos de checklist podem pressionar o limite se os itens forem muitos.

**Estratégia de migração segura (localStorage):**
```
1. Ao carregar o app, checar se `ir_migration_v2_handled` está ausente.
2. Ler `ir_facilitador_profile`, `ir_facilitador_checklist`, `ir_facilitador_checklist_notes`.
3. Se perfil válido encontrado:
   a. Ler `taxYear` do perfil.
   b. Copiar dados para `ir_facilitador_profile_{taxYear}`, etc.
   c. Remover chaves antigas.
   d. Gravar `ir_facilitador_active_tax_year = taxYear`.
   e. Gravar `ir_facilitador_known_tax_years = [taxYear]`.
4. Gravar `ir_migration_v2_handled = 'v2'`.
```

---

### A.4 Impacto em cloud sync (Supabase)

O schema do Supabase já suporta múltiplos anos:

```sql
-- tax_profiles: UNIQUE(user_id, tax_year)
-- checklist_state: vinculado a profile_id (que já distingue anos)
```

`cloud-profile-storage.ts` expõe `loadCloudProfile(userId, taxYear)` e `saveCloudProfile(profile)` usando `profile.taxYear`. O suporte multi-ano **já existe** no backend.

**Gap atual em `useProfileSync`:**
- Ao fazer login, o hook sincroniza apenas o ano derivado de `localProfile?.taxYear ?? getCurrentTaxYear()` (linhas 63, 131).
- Para suportar múltiplos anos, o hook precisaria iterar sobre `ir_facilitador_known_tax_years` e sincronizar cada ano.
- Conflito de merge (local mais novo vs nuvem mais novo) precisaria de política explícita — sugestão: `updatedAt` no perfil, last-write-wins, com toast de aviso.

---

### A.5 Impacto em checklist

**Hoje:** `ir_facilitador_checklist` é um `Record<itemId, boolean>` plano — único por dispositivo.

**Com múltiplos anos:** o ID dos itens de checklist já contém o contexto de categoria (`cl_clt_report`, `cl_bank_reports` etc.) mas **não** o `taxYear`. Dois anos com as mesmas perguntas respondidas gerariam os mesmos IDs de itens.

Isso é **seguro** porque o checklist é derivado dinamicamente de `generateChecklist(profile, profile.taxYear)` — os IDs são estáveis por design. Mas ao trocar de ano, o estado de conclusão de um item não deve "vazar" para o outro.

**Solução:** a chave indexada por `taxYear` (`ir_facilitador_checklist_{taxYear}`) resolve completamente — cada ano tem seu próprio mapa de itens.

**Notas:** mesma lógica aplica para `ir_facilitador_checklist_notes_{taxYear}`.

---

### A.6 Impacto em relatório e PDF

- `relatorio/page.tsx` usa `profile.taxYear` para título e para todas as funções de regras → **sem breaking change** se o perfil certo for passado.
- Link compartilhado (`?d=base64`) codifica `{ profile, checklist? }` → ao adicionar múltiplos anos, o link continua válido para o perfil que ele contém.
- PDF: `relatorio-ir-{taxYear}.pdf` → nome do arquivo já carrega o ano.
- **Risco:** link de relatório compartilhado de um ano 2024 aberto num app que exibe o ano 2025 ativo pode confundir o usuário. Solução: banner "Você está visualizando o relatório de {ano-base}".

---

### A.7 Modelo de dados recomendado

```typescript
// Novo tipo para o store multi-ano
type ProfilesByYear = Record<number, TaxProfile>;        // taxYear → TaxProfile
type ChecklistByYear = Record<number, Record<string, boolean>>;
type NotesByYear    = Record<number, Record<string, string>>;

// Chave única para o ano ativo na UI
const ACTIVE_YEAR_KEY = 'ir_facilitador_active_tax_year';
```

```typescript
// Funções sugeridas em local-profile-storage.ts
loadTaxProfile(taxYear: number): TaxProfile | null
saveTaxProfile(profile: TaxProfile): void          // usa profile.taxYear como chave
loadChecklistState(taxYear: number): Record<string, boolean>
saveChecklistStateMap(taxYear: number, state: Record<string, boolean>): void
listKnownTaxYears(): number[]
deleteProfileYear(taxYear: number): void           // com confirmação explícita
```

**Invariantes a manter:**
- Funções do motor de regras (`tax-rules.ts`) já aceitam `taxYear` — nenhuma alteração necessária lá.
- `TaxProfile.taxYear` permanece como fonte canônica do ano; nunca derivar ano de contexto externo.
- `createEmptyProfile()` continua gerando `taxYear = getFullYear() - 1`; o seletor de ano na UI pode sobrescrever antes de salvar.

---

### A.8 Estratégia de migração segura (end-to-end)

```
Fase 1 — localStorage (sem Supabase, sem auth)
  1. Implementar novo schema de chaves indexadas por taxYear.
  2. Implementar migração one-shot v2 (seção A.3).
  3. Adicionar seletor de ano no header/dashboard.
  4. Testes: migração v1→v2, troca de ano, dados isolados por ano.
  Commit tag: feat(storage): multi-year localStorage

Fase 2 — Supabase (requer auth ativa)
  5. Ajustar useProfileSync para iterar anos conhecidos.
  6. Política de merge last-write-wins com toast.
  7. Testes de integração com perfil multi-ano.
  Commit tag: feat(sync): sincronização multi-ano com Supabase

Fase 3 — UI completa
  8. Tela de histórico de anos (/conta ou /historico).
  9. Comparação side-by-side (item 3.8).
```

---

### A.9 Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Perda de dados na migração v1→v2 | Baixa (migração one-shot defensiva) | Alto | Copiar antes de deletar; testar com perfil real |
| localStorage cheio com muitos anos | Baixa (anos de IR são ~5 campos JSON) | Médio | Alertar se storage > 80% cheio; oferecer delete de anos antigos |
| IDs de checklist colisão entre anos | Nula (chaves indexadas por taxYear eliminam colisão) | — | — |
| Link compartilhado de ano errado confunde destinatário | Média | Baixo | Banner de ano no modo shared view |
| Race condition na sync Supabase (dois dispositivos, anos diferentes) | Baixa | Alto | Política de merge explícita + `updatedAt` |
| Regressão em `useProfileSync` ao iterar múltiplos anos | Média (hook complexo) | Alto | Feature flag + testes de integração antes de ativar |

---

### A.10 Passos incrementais recomendados

1. **Pré-requisito (zero código):** Definir convenção de nomenclatura de chaves e aprovar modelo de dados (A.7).
2. **Sprint isolado — storage layer:** Implementar funções multi-ano em `local-profile-storage.ts` com testes completos. Não ativar na UI ainda.
3. **Migração defensiva:** Implementar `runMigrationV2()` chamado no boot; cobrir com testes unitários.
4. **UI mínima:** Seletor de ano no header (dropdown com anos conhecidos + "Novo ano"). Dashboard e checklist reagem ao ano ativo.
5. **Supabase (post-auth):** Ajustar `useProfileSync` para sincronizar todos os anos conhecidos. Política de merge.
6. **Tela de histórico:** Listar anos com resumo de complexidade; link para relatório de cada ano.
7. **Comparação:** Implementar item 3.8 (side-by-side).

> **Critério de conclusão mínimo:** usuário pode declarar IRPF 2025 e IRPF 2026 no mesmo app sem que os dados se sobrescrevam.

---

## Apêndice B — Auditoria técnica: upload seguro de documentos

> Gerado em: overnight-deep-work · Branch: `overnight-deep-work`
> Objetivo: documentar UX, modelo de dados, infra e riscos **sem implementar**. Nenhum código funcional alterado.

---

### B.1 Estado atual

Upload de documentos **não existe** no codebase. `ChecklistItem` (`src/types/checklist.ts`) tem campo `relatedGuideSlug?: string` mas não tem `attachmentUrl` ou equivalente. `MELHORIAS.md` item 3.3 registra o requisito com uma linha: _"Requer Supabase Storage. Cada `ChecklistItem` passaria a ter `attachmentUrl?: string`."_

---

### B.2 Proposta de UX

**Fluxo mínimo viável:**
1. Na `/checklist`, cada item pode ter um botão "Anexar" (ícone de clipe).
2. Ao clicar → `<input type="file" accept=".pdf,.jpg,.jpeg,.png">` abre seletor de arquivo.
3. Upload vai para Supabase Storage; ao concluir, `attachmentUrl` é salvo no `checklist_state` (coluna `attachment_url`).
4. Ícone do clipe fica colorido/preenchido para indicar que há anexo; hover mostra nome do arquivo.
5. Clique no ícone preenchido → preview inline (PDF em iframe, imagem direta) ou botão "Baixar".
6. Botão de remoção com confirmação.

**Estados do fluxo:**
- Idle → seletor fechado, ícone cinza.
- Uploading → spinner substituindo ícone; progress bar ou porcentagem.
- Success → ícone colorido; nome do arquivo truncado.
- Error → ícone vermelho; mensagem "Falha ao enviar. Tente novamente." sem bloquear o item.

**Considerações de acessibilidade:**
- `aria-label="Anexar documento para {item.title}"` no botão de upload.
- Feedback de progresso via `aria-live="polite"`.
- Limite de tamanho exibido antes do upload (`Máximo: 5 MB`).

---

### B.3 Modelo de dados

**Extensão de `ChecklistItem`:**
```typescript
// src/types/checklist.ts
export interface ChecklistItem {
  // … campos existentes …
  attachmentUrl?: string;   // URL pública ou signed URL do Supabase Storage
  attachmentName?: string;  // nome original do arquivo (exibição)
}
```

**Schema Supabase (extensão de `checklist_state`):**
```sql
ALTER TABLE checklist_state
  ADD COLUMN attachment_url   text,
  ADD COLUMN attachment_name  text,
  ADD COLUMN attachment_size  integer;   -- bytes, para auditoria de cota
```

**Bucket Supabase Storage:**
```
bucket: "user-documents"   (privado — sem acesso público)
path:   {user_id}/{tax_year}/{item_id}/{filename}
```

**Por que path estruturado:**
- Facilita listagem de todos os arquivos de um ano (`{user_id}/{tax_year}/*`).
- RLS pode usar o prefixo `auth.uid()` para garantir que cada usuário só acessa o próprio diretório.
- Delete em cascata por ano: `storage.deleteObject("user-documents", "{user_id}/{tax_year}/*")`.

---

### B.4 Supabase Storage — configuração e RLS

**Políticas necessárias:**
```sql
-- Leitura: usuário só lê seus próprios arquivos
CREATE POLICY "user can read own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Escrita: usuário só insere no próprio diretório
CREATE POLICY "user can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Delete: usuário só deleta seus próprios arquivos
CREATE POLICY "user can delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**Signed URLs:** para documentos sensíveis, usar `supabase.storage.from('user-documents').createSignedUrl(path, 3600)` (expira em 1h) em vez de URLs públicas permanentes.

**Limite de tamanho:** configurar no bucket (`maxFileSize: 5MB`) e validar no cliente antes de iniciar o upload para UX imediata.

---

### B.5 Limites e cotas

| Plano Supabase | Storage incluído | Transferência/mês |
|----------------|-----------------|-------------------|
| Free           | 1 GB            | 2 GB              |
| Pro            | 100 GB          | 200 GB            |

**Estimativa de uso:** se cada usuário fizer upload de 10 documentos × 500 KB = 5 MB/usuário. Com 1.000 usuários ativos = 5 GB → exige plano Pro.

**Risco de abuso:** sem validação server-side de tipo MIME, usuário pode renomear `.exe` para `.pdf`. Usar `file.type` no cliente (não confiável sozinho) + validação de magic bytes via Edge Function ou Content-Type retornado pelo Supabase após upload.

---

### B.6 Privacidade e conformidade

**Riscos:**
1. Documentos fiscais (CPF, CNPJ, valores de renda) são dados pessoais sensíveis — escopo da LGPD.
2. Armazenamento em nuvem estrangeira (AWS us-east-1 por padrão no Supabase) pode ser questão para usuários preocupados com soberania de dados.
3. Acesso de suporte (service role) pode ler qualquer arquivo — deve ser controlado por política organizacional, não apenas RLS.

**Mitigações:**
- Criptografia client-side antes do upload (ex.: Web Crypto API AES-GCM com chave derivada da senha do usuário) elimina exposição no servidor. Custo: preview inline não funciona no navegador — arquivo deve ser descriptografado antes de exibir.
- Política de retenção: deletar arquivos automaticamente N dias após o prazo de entrega do IRPF.
- Aviso na UI: "Seus documentos são armazenados com segurança. Não compartilhe seu acesso com terceiros."
- Deletar todos os arquivos ao "Limpar todos os dados" (`ClearDataModal`).

---

### B.7 Impacto no app existente

| Componente | Mudança necessária |
|------------|-------------------|
| `ChecklistItem` type | + `attachmentUrl?`, `attachmentName?` |
| `ChecklistItemRow` | + botão Anexar, estado de upload, preview |
| `ChecklistGroup` | Passar `onAttach` callback |
| `checklist/page.tsx` | Callback de upload → Supabase Storage |
| `local-profile-storage.ts` | Sem mudança (upload só existe no modo cloud) |
| `cloud-profile-storage.ts` | + `saveAttachmentUrl(userId, taxYear, itemId, url, name)` |
| `checklist_state` (Supabase) | + colunas `attachment_url`, `attachment_name`, `attachment_size` |
| `ClearDataModal` | + deletar arquivos do Storage ao limpar dados |
| `ReportPDF` | Opcional: listar documentos com "✓ Anexado" |

**Escopo fora do app:** bucket Supabase, políticas RLS de Storage, Edge Function de validação de MIME (opcional).

---

### B.8 Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Upload de arquivo malicioso | Baixa | Alto | Whitelist de MIME types no cliente + validação server-side |
| Cota Supabase esgotada | Média (com crescimento) | Médio | Monitorar uso; alertar usuário ao aproximar cota pessoal |
| URL expirada em link compartilhado | Alta (signed URLs expiram) | Médio | Não incluir anexos no link compartilhado (`?d=base64`) |
| Dados orphãos no Storage após delete do perfil | Média | Baixo | Trigger de delete em cascata ou job de limpeza |
| Upload falho sem rollback | Média | Médio | Transação: gravar URL no DB só após upload confirmado |
| Regressão no modo offline/guest | Alta | Alto | Funcionalidade disponível apenas para usuários autenticados; desabilitar UI graciosamente |

---

### B.9 Estratégia incremental recomendada

```
Fase 1 — Infraestrutura (sem UI)
  1. Criar bucket "user-documents" com RLS.
  2. Adicionar colunas em checklist_state.
  3. Implementar funções em cloud-profile-storage.ts (uploadDocument, deleteDocument, loadAttachments).
  4. Testes de integração com Supabase local (supabase start).
  Commit tag: feat(storage): bucket e funções de upload de documentos

Fase 2 — UI mínima
  5. Botão "Anexar" em ChecklistItemRow (apenas para usuários autenticados).
  6. Fluxo completo: selecionar → upload → feedback → preview.
  7. Remoção com confirmação.
  Commit tag: feat(checklist): upload e visualização de documentos

Fase 3 — Hardening
  8. Validação de MIME type e tamanho.
  9. Signed URLs com renovação automática.
  10. Integração com ClearDataModal.
  11. Aviso de privacidade antes do primeiro upload.
  Commit tag: feat(checklist): hardening e privacidade no upload
```

> **Critério de conclusão mínimo:** usuário autenticado pode anexar um PDF a um item do checklist, visualizá-lo na mesma sessão, e deletá-lo. Usuário não autenticado não vê o botão de upload.

---

## Apêndice C — Auditoria técnica: PWA e cache offline

> Gerado em: overnight-deep-work · Branch: `overnight-deep-work`
> Objetivo: avaliar riscos da estratégia PWA atual e recomendar caminho seguro **sem implementar**.

---

### C.1 Estado atual

`public/manifest.json` existe com `display: "standalone"`, `start_url: "/"` e um único ícone `favicon.ico`. Não há service worker registrado — nem `next-pwa`, `workbox`, nem registro manual em `public/sw.js` ou `src/app/layout.tsx`.

**O que funciona hoje:**
- O app aparece como instalável em Chrome/Edge/Safari (o `manifest.json` é suficiente para o prompt "Adicionar à tela inicial").
- Sem service worker = sem cache offline = sem risco de páginas estáticas.

**O que não funciona:**
- Offline: abre tela em branco (navegador retorna erro 503 sem cache).
- Ícone de alta resolução: `favicon.ico` é aceito mas subótimo para splash screens e ícones de tela inicial.
- `theme_color` não é aplicado dinamicamente por dark mode.

---

### C.2 Riscos de adicionar service worker (next-pwa / Workbox)

| Risco | Descrição | Severidade |
|-------|-----------|------------|
| **Stale shell** | Cache de app shell (`_next/static`) ficando obsoleto após deploy → usuário vê versão antiga indefinidamente | Alta |
| **Stale API routes** | `POST /api/ask` (Claude) ou rotas futuras de auth sendo servidas do cache | Alta |
| **Cache de páginas com dados dinâmicos** | `/relatorio?d=...` ou `/dashboard` cacheados com snapshot de dados antigos | Média |
| **Falha silenciosa de atualização** | Service worker instala nova versão mas não assume controle até o usuário fechar todas as abas → bug difícil de reproduzir | Média |
| **Conflito com SSR/RSC** | Next.js App Router usa React Server Components e streaming; Workbox não tem tratamento nativo para payloads de RSC — pode corromper respostas de `/_next/data/` | Alta |
| **Debugging difícil** | Cache opaco no DevTools; `skipWaiting` agressivo pode causar inconsistências de estado | Média |
| **Tamanho de cache** | Em mobile, cache de SW pode ocupar dezenas de MB de páginas estáticas — Safari tem limite de 50 MB por origem | Baixa |

---

### C.3 Análise de compatibilidade: next-pwa + App Router

`next-pwa@5.x` foi construído para o Pages Router e usa `getServerSideProps`/`getStaticProps` para pré-cache. Com o App Router (usado neste projeto), os problemas são:

1. As rotas não geram arquivos estáticos previsíveis em `_next/data/` — o Workbox `StaleWhileRevalidate` pode usar dados de render errados.
2. `next-pwa` ainda não suporta oficialmente o App Router (último release: 2023; repositório com baixa atividade).
3. Alternativas como `@ducanh2912/next-pwa` oferecem suporte experimental ao App Router mas são não-oficiais.

**Recomendação:** não usar `next-pwa` no estado atual. Aguardar suporte oficial ou migrar para Serwist (fork mantido).

---

### C.4 Estratégia recomendada de cache offline

**Camada 1 — Apenas assets estáticos (seguro):**
Cachear apenas CSS, JS e fontes de `_next/static/` com estratégia `CacheFirst` (nunca expiram por causa do content hash). Não cachear páginas HTML nem rotas de API.

```javascript
// sw.js hipotético (Workbox manual)
registerRoute(
  ({ url }) => url.pathname.startsWith('/_next/static/'),
  new CacheFirst({ cacheName: 'static-assets', plugins: [new ExpirationPlugin({ maxEntries: 200 })] }),
);
// NUNCA cachear: /api/*, /relatorio, /dashboard, /questionario
```

**Camada 2 — Offline fallback page:**
Pré-cachear uma página `/offline` simples com mensagem "Você está offline. Seus dados salvos continuam disponíveis ao reconectar." Servir essa página para qualquer rota de navegação que falhe.

**Camada 3 — localStorage funciona offline por natureza:**
O checklist, perfil e notas estão em `localStorage` — acessíveis sem rede. O app pode mostrar dados locais mesmo offline; apenas sync com Supabase e Claude API falharão.

---

### C.5 Invalidação de cache após deploy

**Problema central:** um usuário com SW instalado e cache de shell pode não receber o novo deploy por horas ou dias.

**Solução canônica:**
1. SW verifica hash do `NEXT_DEPLOY_ID` (injetado via `next.config.ts` como variável de build).
2. Se hash mudou → `self.skipWaiting()` + `clients.claim()` + reload forçado com toast "Nova versão disponível — recarregando...".
3. Alternativa mais conservadora: toast "Nova versão disponível. [Recarregar]" sem reload automático.

**Opção mais segura para este app:** como o app é simples e o `localStorage` é a fonte de verdade, reload automático é seguro — não há estado em memória crítico que seria perdido.

---

### C.6 Ícones e splash screens

Para instalação correta em Android e iOS, o `manifest.json` precisa de:

```json
{
  "icons": [
    { "src": "/icon-192.png",  "sizes": "192x192",  "type": "image/png" },
    { "src": "/icon-512.png",  "sizes": "512x512",  "type": "image/png", "purpose": "maskable" }
  ]
}
```

Safari iOS usa `apple-touch-icon` em vez do manifest — adicionar em `layout.tsx`:
```html
<link rel="apple-touch-icon" href="/icon-192.png" />
```

**Custo:** criar dois PNGs (192×192 e 512×512) com margem de segurança para máscara (safe zone: 80% do tamanho).

---

### C.7 Recomendação final

| Ação | Quando |
|------|--------|
| Adicionar ícones 192px e 512px ao manifest | Imediato — sem risco, melhora instalabilidade |
| Adicionar `apple-touch-icon` em `layout.tsx` | Imediato — sem risco |
| Adicionar `theme-color` meta tag com media query dark | Imediato — sem risco |
| Service worker com cache de assets estáticos | Após App Router ter suporte estável em next-pwa/Serwist |
| Cache offline de páginas HTML | Nunca sem estratégia de invalidação testada |
| `next-pwa@5.x` | Não recomendado — incompatível com App Router |

> **Critério de conclusão mínimo para PWA completo:** app instalável com ícones corretos, page offline funcional, assets estáticos cacheados, e mecanismo de atualização automática após deploy.
