# Melhorias e Roadmap — IR Facilitador

Este documento cataloga todas as melhorias identificadas para o IR Facilitador, organizadas por categoria e prioridade. Serve como backlog técnico e produto para o desenvolvimento após o MVP 0.1.

**Legenda de prioridade:**
- `P1` — Alta prioridade: impacto direto na qualidade percebida ou na confiabilidade
- `P2` — Média prioridade: melhora significativa sem ser bloqueante
- `P3` — Baixa prioridade: nice-to-have, futura exploração

---

## 1. Correções e dívida técnica

### 1.1 Campos sem perguntas no questionário `P1`

**Problema:** Os campos `income.hasBusinessIncome`, `investments.hasEtfs` e `investments.hasPrivatePension` existem no tipo `TaxProfile` mas nunca são perguntados. Estão sempre `false`.

**Solução:** Adicionar 3 perguntas ao questionário ou remover os campos do tipo enquanto não forem implementados para evitar confusão futura.

---

### 1.2 Flicker de conteúdo vazio no mount `P1`

**Problema:** Todas as páginas client-side renderizam `null` até o `useEffect` carregar o `localStorage`. Isso cria uma oscilação visual perceptível — especialmente em conexões lentas ou dispositivos antigos.

**Solução:** Substituir o padrão `useEffect` + `setState` por [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), que é a API correta do React para sincronizar estado com fontes externas (localStorage incluído). Isso elimina o flicker sem necessidade de `startTransition`.

```typescript
// src/lib/hooks/useLocalStorage.ts
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useLocalStorage<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch { return fallback; }
    },
    () => fallback, // server snapshot
  );
}
```

---

### 1.3 Testes unitários para o motor de regras `P1`

**Problema:** `tax-rules.ts` contém toda a lógica de negócio do app e não tem nenhum teste. É o arquivo com maior risco de regressão.

**Solução:** Instalar Vitest (compatível com Next.js) e criar `src/lib/rules/tax-rules.test.ts`.

Casos de teste prioritários:
- `classifyComplexity`: perfil simples → `simple`; perfil com criptoativos → `complex`; perfil com imóvel sem venda → `medium`
- `generateChecklist`: verifica que cada flag gera o(s) item(ns) correspondente(s) e que `completed` é inicializado corretamente pelo campo `documents`
- `generateAlerts`: verifica o alerta de despesas médicas sem recibo; verifica que perfil limpo não gera alertas
- `calculateChecklistProgress`: 0 itens → 0%; todos concluídos → 100%; itens opcionais ignorados

```bash
npm install -D vitest @vitest/coverage-v8
```

---

### 1.4 Error Boundaries nas páginas client-side `P2`

**Problema:** Se o `localStorage` contiver JSON corrompido e o fallback falhar, a página quebra com erro em branco.

**Solução:** Criar um `ErrorBoundary` component e envolver as páginas que leem `localStorage`.

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

### 1.5 Versionamento de regras tributárias por ano-base `P1`

**Problema:** As regras tributárias mudam todo ano. Limites de dedução, isenções, alíquotas — tudo pode mudar entre uma declaração e outra. Hoje o código não tem separação por ano.

**Solução:** Criar estrutura de versionamento:

```
src/lib/tax-years/
  2025/
    rules.ts       # classifyComplexity, generateChecklist, generateAlerts para 2025
    thresholds.ts  # limites numéricos (ex: teto de dedução de educação)
  2026/
    rules.ts
    thresholds.ts
  index.ts         # exporta as regras do ano corrente
```

O `TaxProfile` já tem `taxYear: number` — basta usá-lo para selecionar o conjunto de regras correto.

---

## 2. UX e Interface

### 2.1 Edição de respostas sem reiniciar o questionário `P1`

**Problema:** Se o usuário quiser corrigir uma resposta, precisa clicar em "Refazer diagnóstico" e responder tudo do zero.

**Solução:** Adicionar uma tela de revisão antes de finalizar, ou uma página `/questionario/editar` que exibe todas as respostas em forma de lista editável (toggle Sim/Não por item).

---

### 2.2 Indicador de salvamento automático `P2`

**Problema:** O usuário não sabe que suas respostas estão sendo salvas automaticamente.

**Solução:** Toast ou indicador discreto "Salvo automaticamente" que aparece brevemente após cada atualização do `localStorage`.

---

### 2.3 Skeleton loaders `P2`

**Problema:** Páginas client-side aparecem em branco antes do `useEffect` completar.

**Solução:** Criar componentes skeleton que imitam o layout da página e são exibidos enquanto `state === null`.

```tsx
// src/components/ui/Skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}
```

---

### 2.4 Filtros no checklist `P2`

**Problema:** Com muitos itens, o checklist pode ficar longo sem forma de focar no que falta.

**Solução:** Adicionar filtros de visualização:
- Mostrar apenas pendentes
- Filtrar por categoria
- Ordenar por prioridade (obrigatórios primeiro)

---

### 2.5 Anotações pessoais nos itens do checklist `P3`

**Problema:** O usuário pode querer registrar onde guardou o documento ou adicionar um lembrete.

**Solução:** Campo de texto livre em cada item do checklist, salvo junto ao estado no `localStorage`. Exibido como tooltip ou expansão do item.

---

### 2.6 Contador regressivo até o prazo da Receita Federal `P2`

**Problema:** O prazo da DIRPF (geralmente fim de maio) é uma informação crítica que o app não exibe.

**Solução:** Componente `DeadlineBanner` que calcula os dias restantes até o prazo e exibe na landing page e no dashboard. O prazo deve ser configurável por ano-base.

```typescript
// src/lib/tax-years/2025/thresholds.ts
export const FILING_DEADLINE = new Date('2025-05-30T23:59:59-03:00');
```

---

### 2.7 Modo de impressão para guias `P3`

**Problema:** Guias têm informações detalhadas que o usuário pode querer imprimir para usar offline.

**Solução:** Adicionar `@media print` styles que ocultam header, footer e botões, deixando apenas o conteúdo do guia.

---

### 2.8 Compartilhamento do relatório por link `P2`

**Problema:** Para compartilhar o relatório com um contador ou familiar, o usuário precisa copiar texto manualmente.

**Solução:** Codificar o `TaxProfile` em base64 e gerar uma URL com o estado embutido: `/relatorio?d=<base64>`. Ao acessar com o parâmetro, o app lê os dados da URL em vez do `localStorage`.

**Atenção:** Dados do perfil não contêm CPF, dados bancários ou informações sensíveis no MVP — o compartilhamento por URL é seguro para este conjunto de dados.

---

## 3. Novas funcionalidades

### 3.1 Exportação do relatório em PDF `P1`

**Problema:** O relatório em texto plano é limitado — sem formatação, sem visual profissional.

**Solução:** Usar [`@react-pdf/renderer`](https://react-pdf.org/) (client-side) ou uma API Route com Puppeteer/Chromium (server-side) para gerar PDF formatado.

A abordagem client-side com `@react-pdf/renderer` é preferível no MVP por não precisar de servidor:

```bash
npm install @react-pdf/renderer
```

---

### 3.2 Múltiplos perfis / anos de declaração `P2`

**Problema:** O app suporta apenas um perfil por vez. Usuários que precisam declarar para mais de um ano, ou que queiram comparar anos, não têm como.

**Solução:** Trocar o modelo de armazenamento de um único profile para um array de perfis indexados por `taxYear`. Adicionar seletor de ano na interface.

```typescript
// localStorage key: ir_facilitador_profiles
type ProfilesStore = Record<number, TaxProfile>; // taxYear → profile
```

---

### 3.3 Upload e organização de documentos `P2`

**Problema:** O checklist lista os documentos necessários, mas o usuário ainda precisa organizar os arquivos manualmente fora do app.

**Solução (v0.2):** Integrar Supabase Storage para upload de arquivos por categoria. Cada `ChecklistItem` passaria a ter um `attachmentUrl?: string`.

A estrutura de pastas no Supabase seria:
```
{userId}/
  {taxYear}/
    income/
    bank/
    assets/
    ...
```

---

### 3.4 Autenticação e persistência na nuvem `P1` (v0.2)

**Problema:** O perfil existe apenas no browser. Trocar de dispositivo ou limpar o browser perde tudo.

**Solução:** Implementar Supabase Auth (email/senha ou Google OAuth) e migrar o `localStorage` para tabelas no PostgreSQL do Supabase.

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

A migração deve ser gradual: se o usuário não estiver logado, continua usando `localStorage`. Se logar, importa os dados locais para a nuvem.

---

### 3.5 Notificações de prazo por e-mail `P3`

**Problema:** O usuário pode esquecer de completar a declaração antes do prazo.

**Solução (pós-auth):** Após criar conta, o usuário pode optar por receber lembretes por email (usando Resend ou SendGrid via Supabase Edge Functions):
- 30 dias antes do prazo: "Você iniciou seu diagnóstico — faltam X documentos"
- 7 dias antes: alerta de urgência
- 1 dia antes: último aviso

---

### 3.6 Integração com IA (Claude API) `P2`

**Problema:** O app hoje dá orientações estáticas. Muitos usuários têm dúvidas específicas que os guias não conseguem responder completamente.

**Solução:** Integrar a Claude API como assistente contextual. O usuário pode fazer perguntas específicas sobre sua situação, e o Claude responde com base no perfil tributário já coletado.

Ponto de entrada sugerido: botão "Tirar dúvida" em cada guia ou no relatório. O prompt do sistema incluiria o `TaxProfile` serializado para que o Claude tenha contexto.

```typescript
// src/app/api/ask/route.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: Request) {
  const { question, profile } = await request.json();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: `Você é um assistente de orientação tributária para o IR Facilitador.
O perfil tributário do usuário é: ${JSON.stringify(profile)}.
Responda de forma simples, direta e sem juridiquês.
Sempre recomende revisão com contador para casos complexos.
Nunca garanta certeza absoluta sobre regras tributárias.`,
    messages: [{ role: 'user', content: question }],
  });

  return Response.json({ answer: message.content[0] });
}
```

**Guardrails obrigatórios:**
- Nunca afirmar que o app garante declaração correta
- Sempre recomendar contador para casos complexos
- Não solicitar CPF, dados bancários ou senhas

---

### 3.7 OCR de informes de rendimentos `P3`

**Problema:** O usuário precisa olhar o informe de rendimentos e transcrever os valores manualmente.

**Solução:** Usar Claude API com visão (multimodal) para analisar imagem ou PDF do informe e extrair automaticamente os campos relevantes (rendimentos tributáveis, IRRF retido, INSS descontado).

Todos os valores extraídos devem ser marcados como "precisa de conferência" pelo usuário.

---

### 3.8 Comparação entre anos-base `P3`

**Problema:** O usuário não consegue ver como sua situação tributária mudou de um ano para outro.

**Solução (pós múltiplos perfis):** Tela de comparação que mostra side-by-side dois anos, destacando mudanças de complexidade e novos documentos necessários.

---

## 4. Performance

### 4.1 Memoização de dados derivados `P2`

**Problema:** `generateChecklist`, `generateAlerts` e `getApplicableGuideSlugs` são chamadas toda vez que a página remonta. Para perfis complexos, isso é trabalho desnecessário.

**Solução:** Usar `useMemo` para derivar os dados apenas quando o profile muda:

```tsx
const checklist = useMemo(
  () => generateChecklist(profile),
  [profile]
);
```

---

### 4.2 Lazy loading dos guias na listagem `P3`

**Problema:** A página `/guias` carrega os dados de todos os 17 guias mesmo que o perfil aplique apenas 5.

**Solução:** Já está correto — `getApplicableGuideSlugs` filtra os slugs e só os guias aplicáveis são exibidos. Nenhuma melhoria necessária aqui além do já implementado.

---

### 4.3 Progressive Web App (PWA) `P2`

**Problema:** O app não é instalável como app nativo no celular.

**Solução:** Adicionar `manifest.json` e service worker (via `next-pwa`) para permitir instalação como PWA. Inclui funcionamento offline para os guias (que são estáticos).

```bash
npm install next-pwa
```

---

## 5. Acessibilidade

### 5.1 Navegação por teclado no questionário `P1`

**Problema:** Os botões Sim/Não do questionário não têm atalhos de teclado. Usuários que navegam sem mouse dependem de Tab + Enter, que não é intuitivo.

**Solução:** Adicionar `accessKey` ou capturar `keydown` para mapear:
- `s` ou `1` → Sim
- `n` ou `2` → Não
- `?` ou `3` → Não sei
- `←` → Voltar

---

### 5.2 Anúncio de mudança de pergunta para leitores de tela `P1`

**Problema:** Ao avançar para a próxima pergunta, leitores de tela não são notificados que o conteúdo mudou.

**Solução:** Usar `aria-live="polite"` em um elemento invisível que recebe o texto da pergunta atual:

```tsx
<div aria-live="polite" className="sr-only">
  {current.title}
</div>
```

---

### 5.3 Verificação de contraste de cores `P2`

**Problema:** As cores `indigo-400`, `yellow-600` e `gray-400` usadas em textos informativos podem não ter contraste suficiente (WCAG AA exige 4.5:1 para texto normal).

**Solução:** Auditar todas as combinações texto/fundo com a ferramenta de contraste do Chrome DevTools e ajustar onde necessário.

---

### 5.4 Focus management entre perguntas `P2`

**Problema:** Ao avançar para a próxima pergunta, o foco do teclado não é movido para o novo conteúdo.

**Solução:** Usar `useRef` no container da pergunta e chamar `.focus()` após atualizar o índice:

```tsx
const questionRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  questionRef.current?.focus();
}, [currentIndex]);
```

---

## 6. Segurança e privacidade

### 6.1 Política de privacidade e termos de uso `P1` (obrigatório antes de lançamento público)

**Problema:** O app não tem documentos legais.

**Solução:** Criar páginas `/privacidade` e `/termos` com:
- O que é coletado (apenas dados no browser local no MVP)
- Como os dados são usados
- Direitos do usuário (LGPD)
- Responsabilidade pelos dados declarados

---

### 6.2 Botão "Limpar todos os dados" `P1`

**Problema:** Não há forma de o usuário apagar seus dados do browser além de limpar o localStorage manualmente.

**Solução:** Adicionar botão na landing page ou no dashboard que chama `clearAll()` do storage layer, com confirmação modal antes de executar.

---

### 6.3 Aviso de dados sensíveis no relatório compartilhado `P2`

**Problema:** Ao implementar compartilhamento por link (melhoria 2.8), o usuário pode não perceber que está compartilhando informações do seu perfil tributário.

**Solução:** Modal de confirmação antes de gerar o link, explicando o que está sendo compartilhado. O link deve ter validade (ex: 7 dias) e não deve incluir dados de documentos opcionais.

---

## 7. Produto e monetização (longo prazo)

### 7.1 Modo contador `P3`

**Funcionalidade:** Uma interface separada onde contadores podem gerenciar múltiplos clientes, cada um com seu próprio `TaxProfile`. Permite acompanhar o progresso de vários clientes em uma única tela.

**Modelo:** Requer autenticação com role `accountant` e um modelo multi-tenant no Supabase.

---

### 7.2 Marketplace de revisão profissional `P3`

**Funcionalidade:** Para declarações complexas, o app pode recomendar e conectar o usuário a contadores parceiros que revisam a declaração mediante pagamento.

**Fluxo:** O usuário exporta o relatório → seleciona um contador parceiro → compartilha o perfil → contador revisa e responde.

---

### 7.3 Plano premium `P3`

**Funcionalidade:** Diferenciação entre versão gratuita (funcionalidades atuais + PDF) e versão paga (histórico multi-ano, upload de documentos, assistente IA, notificações de prazo).

---

## 8. Infraestrutura e DevOps

### 8.1 CI/CD com GitHub Actions `P2`

**Solução:**

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

### 8.2 Deploy no Vercel `P1`

**Status:** O app está pronto para deploy no Vercel sem configurações adicionais.

**Passos:**
1. Criar repositório no GitHub
2. Conectar ao Vercel
3. Definir variáveis de ambiente (nenhuma no MVP)
4. Ativar auto-deploy no push para `main`

---

### 8.3 Variáveis de ambiente tipadas `P2`

**Problema:** Quando Supabase e Claude API forem adicionados, as env vars ficarão soltas sem validação.

**Solução:** Usar [`@t3-oss/env-nextjs`](https://env.t3.gg/) para validar variáveis de ambiente em build time:

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
```

---

## Resumo de prioridades

### P1 — Fazer antes do próximo release

| # | Melhoria |
|---|----------|
| 1.1 | Campos sem perguntas no questionário |
| 1.2 | Flicker no mount → `useSyncExternalStore` |
| 1.3 | Testes unitários do motor de regras |
| 1.5 | Versionamento de regras por ano-base |
| 3.1 | Exportação PDF do relatório |
| 3.4 | Autenticação + persistência na nuvem (Supabase) |
| 5.1 | Navegação por teclado no questionário |
| 5.2 | Anúncio para leitores de tela |
| 6.1 | Política de privacidade e termos de uso |
| 6.2 | Botão "Limpar todos os dados" |
| 8.2 | Deploy no Vercel |

### P2 — Próxima versão

| # | Melhoria |
|---|----------|
| 2.1 | Edição de respostas sem reiniciar |
| 2.2 | Indicador de salvamento automático |
| 2.3 | Skeleton loaders |
| 2.4 | Filtros no checklist |
| 2.6 | Contador regressivo até o prazo |
| 2.8 | Compartilhamento por link |
| 3.2 | Múltiplos perfis / anos |
| 3.3 | Upload de documentos |
| 3.6 | Integração com IA (Claude API) |
| 4.3 | PWA |
| 8.1 | CI/CD |
| 8.3 | Env vars tipadas |

### P3 — Exploração futura

| # | Melhoria |
|---|----------|
| 2.5 | Anotações no checklist |
| 2.7 | Modo de impressão |
| 3.5 | Notificações de prazo por e-mail |
| 3.7 | OCR de informes |
| 3.8 | Comparação entre anos |
| 7.1 | Modo contador |
| 7.2 | Marketplace de revisão |
| 7.3 | Plano premium |
