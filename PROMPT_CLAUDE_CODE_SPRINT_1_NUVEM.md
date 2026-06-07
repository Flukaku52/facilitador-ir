# Prompt para Claude Code — Sprint 1: Fundação na Nuvem

> **Como usar:** Cole o texto abaixo no Claude Code dentro do projeto. Ele dá todo o contexto necessário para implementar autenticação por e-mail, persistência na nuvem com Supabase, e PDF nativo do relatório.

---

## 🧭 Contexto

Estou continuando o projeto **IR Facilitador** (Next.js 16 + TypeScript + Tailwind). O contexto está nestes arquivos do repositório, que você deve ler na ordem antes de fazer qualquer alteração:

1. `README.md` — descreve o estado atual (v0.2.x)
2. `MELHORIAS.md` — backlog de melhorias com prioridades
3. `AUTOMACAO.md` — visão da feature de automação (Fase 2+, NÃO esta sprint)
4. `IMPLEMENTACAO.md` — guia mestre de execução em 5 fases

**Leia esses 4 arquivos antes de começar.** A Sprint 0 (Fase 0) foi concluída. Agora estamos iniciando a **Sprint 1 — Fase 1: Fundação na Nuvem** do `IMPLEMENTACAO.md`.

## 🎯 Objetivo desta sprint

Habilitar autenticação por e-mail e persistência na nuvem, **mantendo o modo convidado funcional**. Após esta sprint:

- Usuário pode usar o app **sem login** (modo atual continua funcionando)
- Usuário pode criar conta com **e-mail + senha**
- Quando logado, dados ficam salvos no **Supabase** (nuvem)
- Login funciona em **múltiplos dispositivos**
- Recuperação de senha funcional
- Relatório pode ser **baixado em PDF nativo** (não só print do navegador)

## ⚙️ Decisões de produto já tomadas

Não me pergunte sobre estas decisões — siga conforme abaixo:

| Decisão | Escolha | Implicação |
|---|---|---|
| Forma de login | Apenas **e-mail + senha** | Sem Google OAuth nesta sprint |
| Estratégia de usuários | **Opção B — Modo convidado + login opcional** | Sem login, app funciona como hoje |
| Migração de dados | Ao logar, **perguntar** se quer migrar dados locais pra nuvem | Modal com 2 opções: migrar ou descartar |
| Confirmação de e-mail | **Mantida ativa** no Supabase | Mais seguro, mesmo que adicione fricção |
| Storage de perfis | **JSONB no Postgres** | Não normalizar campos individualmente |
| Múltiplos anos | Schema **já suporta** (`UNIQUE(user_id, tax_year)`), mas UI mantém 1 ano por enquanto | Preparação para Fase 5 |

## 🚫 Regras desta sprint — o que NÃO fazer

- ❌ **NÃO** implementar nada do `AUTOMACAO.md` (upload PDF, Open Finance)
- ❌ **NÃO** implementar Google OAuth (decidimos só e-mail)
- ❌ **NÃO** quebrar o modo convidado (usuário sem login continua funcionando idêntico)
- ❌ **NÃO** mudar a interface pública do `TaxProfile`
- ❌ **NÃO** mexer no questionário, motor de regras, ou guias estáticos
- ❌ **NÃO** fazer commit/push até cada tarefa ter critério de pronto atingido
- ❌ **NÃO** comece a próxima tarefa sem minha confirmação explícita

## 🔧 Pré-requisitos do usuário

Eu já criei um projeto novo no Supabase. Quando você precisar das credenciais e configurações, **me peça e eu te passo**. Não tente adivinhar URLs ou chaves.

---

## ✅ Tarefas em ordem (uma por vez, confirmar entre tarefas)

### Tarefa 1 — Setup do banco de dados Supabase

**O que fazer:**

1. Me peça as credenciais do projeto Supabase:
   - Project URL (formato: `https://xxxxx.supabase.co`)
   - Anon/Public Key (chave longa começando com `eyJ...`)
   - Service Role Key (outra chave, marcada como "secret")

2. Crie um arquivo `supabase/schema.sql` no projeto com o seguinte conteúdo:

```sql
-- Tabela principal: perfis fiscais por usuário e ano
CREATE TABLE IF NOT EXISTS tax_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tax_year integer NOT NULL DEFAULT 2025,
  profile jsonb NOT NULL,
  checklist_state jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tax_year)
);

-- Trigger pra atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tax_profiles_updated_at
  BEFORE UPDATE ON tax_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security: usuário só acessa seus próprios dados
ALTER TABLE tax_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profiles"
  ON tax_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profiles"
  ON tax_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profiles"
  ON tax_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profiles"
  ON tax_profiles FOR DELETE
  USING (auth.uid() = user_id);
```

3. Me dê instruções claras de como aplicar esse SQL no Supabase:
   - Abrir SQL Editor no painel do Supabase
   - Colar o conteúdo
   - Clicar em "Run"
   - Confirmar que rodou sem erro

4. Após eu confirmar que apliquei o SQL, me peça pra verificar no Supabase:
   - Tabela `tax_profiles` aparece em Table Editor
   - RLS está habilitado (ícone de cadeado)
   - 4 policies aparecem em Auth → Policies

**Critério de pronto:**
- Arquivo `supabase/schema.sql` criado e versionado
- Eu confirmei que rodei o SQL no Supabase
- Eu confirmei que a tabela e policies existem

**Arquivos criados:**
- `supabase/schema.sql`

---

### Tarefa 2 — Cliente Supabase e variáveis de ambiente

**O que fazer:**

1. Instale dependências:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

2. Estenda `src/env.ts` (já existe da Sprint 0) adicionando:
   - `NEXT_PUBLIC_SUPABASE_URL` (cliente, opcional pra não quebrar modo convidado em build sem Supabase)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (cliente, opcional)
   - `SUPABASE_SERVICE_ROLE_KEY` (servidor, opcional)

3. Me peça pra adicionar essas 3 variáveis no `.env.local`. Você não pode escrever no `.env.local` por questões de segurança — me dê o conteúdo exato pra eu colar.

4. Crie `src/lib/supabase/client.ts` (cliente browser) e `src/lib/supabase/server.ts` (cliente server-side com cookies para SSR), seguindo a documentação oficial do `@supabase/ssr`.

5. Crie `src/lib/supabase/types.ts` com tipos derivados do schema:
```typescript
export type TaxProfileRow = {
  id: string;
  user_id: string;
  tax_year: number;
  profile: TaxProfile; // tipo existente
  checklist_state: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};
```

**Critério de pronto:**
- Pacotes instalados, `package.json` e `package-lock.json` atualizados
- `src/env.ts` estendido com as 3 variáveis Supabase como opcionais
- `src/lib/supabase/` com os 3 arquivos
- `npm run build` passa com e sem as variáveis preenchidas
- `npm run lint` limpo

**Arquivos criados:**
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/types.ts`

**Arquivos modificados:**
- `src/env.ts`
- `package.json`

---

### Tarefa 3 — Páginas e fluxo de autenticação

**O que fazer:**

1. Crie as rotas:
   - `src/app/login/page.tsx` — formulário de login (e-mail + senha)
   - `src/app/cadastro/page.tsx` — formulário de cadastro (nome opcional, e-mail, senha)
   - `src/app/recuperar-senha/page.tsx` — solicitar link de recuperação
   - `src/app/auth/callback/route.ts` — callback pra confirmação de e-mail

2. Crie um hook `src/lib/hooks/useAuth.ts` que expõe:
   - `user` — objeto do usuário logado (ou null)
   - `loading` — boolean indicando se a sessão está sendo carregada
   - `signUp(email, password, name?)`
   - `signIn(email, password)`
   - `signOut()`
   - `requestPasswordReset(email)`

3. Implemente validação com mensagens em português:
   - E-mail formato válido
   - Senha mínimo 8 caracteres
   - Confirmação de senha igual à original
   - Tratamento de erros do Supabase com mensagens amigáveis (e-mail já cadastrado, credenciais inválidas, etc.)

4. UI mantém o estilo visual do app (Tailwind, paleta indigo/cores escuras).

5. Após cadastro: exibir tela "Confirme seu e-mail" com instruções claras.

6. Configurações no Supabase (me dê instruções pra eu fazer):
   - Authentication → URL Configuration
   - Site URL: `http://localhost:3000` (vou trocar pra produção depois)
   - Redirect URLs: adicionar `http://localhost:3000/auth/callback` e a URL de produção

**Critério de pronto:**
- 4 rotas criadas e funcionais
- Hook `useAuth` com testes unitários básicos (mock do Supabase)
- Fluxo completo testado localmente:
  1. Acessar `/cadastro`
  2. Criar conta com e-mail real
  3. Receber e-mail de confirmação
  4. Clicar no link → cair em `/auth/callback`
  5. Ser redirecionado pra dashboard logado
- Fluxo de login funcional
- Fluxo de recuperação de senha funcional
- Erros exibem mensagens em português, sem stack traces

**Arquivos criados:**
- `src/app/login/page.tsx`
- `src/app/cadastro/page.tsx`
- `src/app/recuperar-senha/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/lib/hooks/useAuth.ts`
- `src/lib/hooks/useAuth.test.ts`

---

### Tarefa 4 — Storage Wrapper (modo convidado + nuvem)

**⚠️ Esta é a tarefa mais arriscada da sprint. Faça com extra cuidado.**

**O que fazer:**

1. Refatorar a camada de storage existente sem mudar a interface pública. As funções `loadProfile()`, `saveProfile(profile)` e `clearAll()` continuam com a mesma assinatura, mas internamente decidem onde gravar/ler com base no estado de autenticação.

2. Comportamento esperado:
   - **Usuário deslogado:** lê/escreve em `localStorage` (idêntico ao atual)
   - **Usuário logado:** lê/escreve no Supabase (tabela `tax_profiles`)
   - **Transição (login):** modal pergunta "Você tem dados salvos neste dispositivo. O que deseja fazer?" → opções:
     - "Salvar na nuvem" → migra `localStorage` → Supabase, depois limpa local
     - "Descartar e usar nuvem" → carrega dados da nuvem, limpa local
     - "Cancelar" → faz logout

3. Modifique `useStoredProfile` e `useChecklistStore` (com cuidado — esses são os hooks que tiveram o bug do `getSnapshot` corrigido na Sprint 0). Mantenha o padrão de cache de snapshot.

4. **TESTES OBRIGATÓRIOS** — criar `src/lib/storage/profile-storage.test.ts` cobrindo:
   - Modo convidado: lê e escreve em localStorage
   - Modo autenticado: lê e escreve em Supabase (mock do client)
   - Transição: migração funciona
   - Transição: descarte funciona
   - Snapshot é estável (não causa loop infinito) em ambos os modos

5. Adicione um indicador visual sutil no header: "Salvando na nuvem ☁️" quando logado, sem texto quando convidado.

**Critério de pronto:**
- Interface pública das funções de storage **inalterada**
- 64 testes da Sprint 0 continuam passando
- Pelo menos 10 testes novos cobrindo storage wrapper
- Build, lint e type-check limpos
- Modo convidado testado manualmente: funciona idêntico ao antes
- Modo autenticado testado manualmente: dados aparecem no Supabase Table Editor
- Migração testada manualmente: criar dados como convidado → fazer login → escolher "Salvar na nuvem" → confirmar que aparecem na tabela
- Descarte testado: criar dados locais → login → escolher "Descartar" → confirmar localStorage limpo
- Bug do `getSnapshot` NÃO retornou

**Arquivos modificados:**
- `src/lib/storage/profile-storage.ts` (ou nome equivalente)
- `src/lib/hooks/useStoredProfile.ts`
- `src/lib/hooks/useChecklistStore.ts`

**Arquivos criados:**
- `src/lib/storage/profile-storage.test.ts`
- `src/components/features/MigrationModal.tsx`
- `src/components/layout/CloudIndicator.tsx`

---

### Tarefa 5 — UI de autenticação no header

**O que fazer:**

1. Modificar o header global pra mostrar:
   - **Convidado:** botão "Entrar" no canto superior direito
   - **Logado:** avatar (iniciais) + dropdown com "Minha conta" e "Sair"

2. Criar página `src/app/conta/page.tsx`:
   - Mostrar e-mail do usuário
   - Botão "Alterar senha"
   - Botão "Excluir conta" (com modal de confirmação dupla)
   - Indicador "Membro desde [data]"

3. Adicionar banner sutil no dashboard quando convidado:
   > "Você está usando o IR Facilitador como convidado. Seus dados ficam só neste navegador. [Criar conta para salvar na nuvem]"

   - Banner pode ser fechado e não reaparece na sessão
   - Aparece de novo na próxima visita

4. Após login, esconder o banner.

**Critério de pronto:**
- Header dinâmico funcionando em modo convidado e logado
- Página `/conta` com 3 ações funcionais (alterar senha, excluir conta, exibir dados)
- Banner aparece pra convidado, somenta após login, fechável
- Sem erros no console em qualquer estado
- Build e lint limpos

**Arquivos criados:**
- `src/app/conta/page.tsx`
- `src/components/layout/UserMenu.tsx`
- `src/components/features/GuestBanner.tsx`

**Arquivos modificados:**
- Header global do app (provavelmente em `src/components/layout/`)

---

### Tarefa 6 — PDF nativo do relatório

**O que fazer:**

1. Instalar `@react-pdf/renderer`:
```bash
npm install @react-pdf/renderer
```

2. Criar `src/components/features/RelatorioPDF.tsx` com layout profissional:
   - Header com "IR Facilitador" e data de geração
   - Seção: Perfil identificado
   - Seção: Complexidade estimada
   - Seção: Alertas
   - Seção: Checklist (com marcação visual de concluídos)
   - Footer: "Documento gerado pelo IR Facilitador. Orientação educacional, não substitui contador."

3. No `/relatorio`, substituir o atual botão "Imprimir/PDF" por:
   - "Imprimir (rápido)" → mantém comportamento de `window.print()`
   - "Baixar PDF" → gera PDF nativo com `@react-pdf/renderer` e baixa

4. PDF deve abrir corretamente em qualquer leitor (não só no Chrome).

**Critério de pronto:**
- PDF gerado é legível, com formatação clara
- Funciona em modo convidado e logado
- Tamanho do PDF razoável (< 500KB)
- Build e lint limpos
- Testar abrindo o PDF no Preview do macOS

**Arquivos criados:**
- `src/components/features/RelatorioPDF.tsx`

**Arquivos modificados:**
- `src/app/relatorio/page.tsx`

---

### Tarefa 7 — Deploy e configuração de produção

**O que fazer:**

1. Me dê instruções claras pra:
   - Adicionar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no Vercel (production)
   - Atualizar Site URL e Redirect URLs no Supabase pra incluir a URL de produção do Vercel

2. Faça push e aguarde meu OK pra fazer deploy.

3. Após deploy, me dê roteiro de smoke test em produção:
   - Modo convidado: questionário, dashboard, checklist, relatório, PDF
   - Cadastro com e-mail real
   - Recebimento de e-mail de confirmação
   - Login
   - Verificar dados aparecem no Supabase
   - Logout e relogin em outro dispositivo (ou navegador anônimo)
   - Excluir conta

**Critério de pronto:**
- Eu confirmei que adicionei as 3 variáveis no Vercel
- Eu confirmei que atualizei URLs no Supabase
- Deploy em produção funcionando
- Smoke test completo aprovado por mim
- Bug zero, comportamento idêntico ao testado localmente

---

## 🔍 Verificação final da sprint

Antes de declarar a sprint completa:

- [ ] Todas as 7 tarefas concluídas em ordem
- [ ] Todos os critérios de pronto atendidos
- [ ] `npm run lint` limpo
- [ ] `npm run test:run` passa todos os testes
- [ ] `npm run build` sem erros
- [ ] `npx tsc --noEmit` limpo
- [ ] CI verde no GitHub
- [ ] Modo convidado funciona idêntico ao MVP 0.2 (smoke test completo)
- [ ] Modo autenticado: cadastro, login, dados na nuvem, logout
- [ ] Migração local → nuvem funcional
- [ ] PDF nativo do relatório baixado e legível
- [ ] `README.md` atualizado com as novas funcionalidades
- [ ] `MELHORIAS.md` atualizado: itens 3.1, 3.4 marcados como ✅

## 📤 Como me reportar entre tarefas

Após cada tarefa, me reporte:

1. **O que foi feito** — lista objetiva
2. **Decisões não óbvias** — se você precisou escolher algo que não estava explícito no prompt
3. **Arquivos criados/modificados** — com contagem de linhas
4. **Como eu testo** — passo a passo claro do que devo verificar
5. **Pendências da tarefa** — caso algo precise da minha ação fora do Claude Code

Aguarde minha confirmação **explícita** antes de avançar.

## ⚠️ Sinais de alerta

Pare e me consulte se:
- Algum teste da Sprint 0 começar a falhar
- O modo convidado parar de funcionar idêntico ao antes
- O bug do `getSnapshot` voltar
- Você precisar mudar a interface pública de qualquer função core
- Aparecer necessidade de instalar mais de 1-2 bibliotecas em uma tarefa
- Algo no Supabase parecer não responder como esperado

## 🎯 Lembrete final

Esta sprint é **mais complexa** que a Sprint 0 porque envolve serviços externos e estado distribuído (local + nuvem). Por isso:

- **Não tenha pressa.** Cada tarefa tem critério de pronto. Cumpra um por vez.
- **Teste cada coisa antes de seguir.** Não acumule débito.
- **Quando em dúvida, pergunte.** Melhor uma mensagem extra que uma decisão errada.

Vamos lá. Comece pela Tarefa 1 — me peça as credenciais do Supabase.
