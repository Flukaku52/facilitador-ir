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

### 1.6 Validar thresholds de 2026 com fonte oficial `P1` ⬜

Os valores em `src/lib/tax-years/2026/thresholds.ts` foram inseridos como estimativa para viabilizar testes de versionamento. **Devem ser confirmados com a publicação oficial da Receita Federal antes de qualquer deploy em produção** que exiba esses valores ao usuário.

Campos a validar:
- `EDUCATION_DEDUCTION_LIMIT_PER_PERSON` (atualmente R$ 3.800,00 — estimado)
- `DEPENDENT_ANNUAL_DEDUCTION` (atualmente R$ 2.375,08 — estimado)
- `SIMPLIFIED_DEDUCTION_LIMIT` (atualmente R$ 17.000,00 — estimado)
- `FILING_DEADLINE` (atualmente 2026-05-29 — estimado)

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

---

## 3. Novas funcionalidades

### 3.1 Exportação do relatório em PDF `P1` 🔄

**Status:** `window.print()` implementado — funciona para imprimir ou salvar como PDF pelo navegador. PDF nativo com `@react-pdf/renderer` ainda não implementado.

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

### 3.4 Autenticação e persistência na nuvem `P1` ⬜ (v0.3)

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

### 5.3 Verificação de contraste de cores `P2` ⬜

Auditar combinações texto/fundo com Chrome DevTools. Focar em `indigo-400`, `yellow-600` e `gray-400` sobre fundos claros/escuros.

---

### 5.4 Focus management entre perguntas `P2` ⬜

```tsx
const questionRef = useRef<HTMLDivElement>(null);
useEffect(() => { questionRef.current?.focus(); }, [currentIndex]);
```

---

## 6. Segurança e privacidade

### 6.1 Política de privacidade e termos de uso ✅

Páginas `/privacidade` e `/termos` implementadas e linkadas no footer.

---

### 6.2 Botão "Limpar todos os dados" ✅

`ClearDataModal` no painel: modal de confirmação → `clearAll()` → redirect para `/`.

---

### 6.3 Aviso de dados sensíveis no relatório compartilhado `P2` ⬜

Modal de confirmação antes de gerar o link de compartilhamento, explicando o que está sendo compartilhado.

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

### 9.1 Chaves de localStorage: hífen vs underscore `P2` ⬜

Investigar se existe (ou existiu) a chave `ir-facilitador-profile` (com hífen) no localStorage de usuários reais, além da chave atual `ir_facilitador_profile` (com underscore). O código atual usa underscore em todos os lugares (`useStoredProfile.ts`, `local-profile-storage.ts`, `useChecklistStore.ts`). Se a chave com hífen existiu em versão anterior e nunca foi migrada, usuários antigos estariam perdendo seus dados silenciosamente.

**Verificar:** abrir DevTools em produção e inspecionar todas as chaves do `localStorage`. Remover a chave órfã (se existir) ou adicionar migração de leitura se houver usuários afetados.

---

### 9.2 Feedback de dados corrompidos no localStorage `P2` ✅

`useStoredProfile` captura erros de `JSON.parse` e retorna `null` — comportamento intencional para estabilidade do `useSyncExternalStore`. Porém o usuário não recebe feedback: o app simplesmente mostra "Você ainda não concluiu o diagnóstico" sem explicar que os dados anteriores foram perdidos.

**Solução proposta (Opção A):** Expor flag `wasCorrupted` no hook via variável externa, e exibir um toast "Seus dados anteriores não puderam ser carregados" quando `wasCorrupted === true`. Não altera o contrato de `getSnapshot`.

O `ErrorBoundary` atual não cobre esse cenário — ele captura apenas exceções de render, não erros de storage pré-render.

---

## Resumo de prioridades — pendentes

### P1 — Antes do próximo release

| # | Melhoria |
|---|----------|
| 1.6 | Validar valores em `2026/thresholds.ts` com fonte oficial da Receita Federal antes de produção |
| 3.4 | Autenticação + persistência na nuvem (Supabase) |

### P2 — Próxima versão

| # | Melhoria |
|---|----------|
| 2.5 | Anotações no checklist |
| 3.1 | PDF nativo com `@react-pdf/renderer` |
| 3.2 | Múltiplos perfis / anos |
| 3.3 | Upload de documentos |
| 4.3 | Service worker / cache offline (PWA completo) |
| 5.3 | Verificação de contraste |
| 5.4 | Focus management entre perguntas |
| 6.3 | Aviso de dados no compartilhamento |
| 9.1 | Investigar chave `ir-facilitador-profile` (hífen) vs `ir_facilitador_profile` (underscore) — possível órfã |
| 9.2 | Toast "dados corrompidos" quando `useStoredProfile` descarta JSON inválido | ✅ |

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
