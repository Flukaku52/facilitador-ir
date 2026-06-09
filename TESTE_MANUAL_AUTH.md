# Checklist Manual — Autenticação e Conta

Testes manuais para os fluxos de autenticação. Execute antes de cada lançamento ou mudança em `src/app/auth/`, `src/lib/hooks/useAuth.ts` ou variáveis de ambiente do Supabase.

---

## 1. Cadastro e confirmação

- [ ] Novo e-mail → formulário de cadastro → e-mail de confirmação chega na caixa de entrada
- [ ] Link de confirmação redireciona para `/dashboard` autenticado
- [ ] Tentar cadastrar e-mail já existente → mensagem "Este e-mail já está cadastrado"
- [ ] Tentar cadastrar com senha muito curta → mensagem "A senha deve ter pelo menos 8 caracteres"
- [ ] Tentar cadastrar com e-mail inválido → mensagem "E-mail inválido"

## 2. Login com senha

- [ ] Senha correta → redireciona para `/dashboard`
- [ ] Senha errada → mensagem "E-mail ou senha incorretos"
- [ ] E-mail não confirmado → mensagem "Confirme seu e-mail antes de entrar"
- [ ] Muitas tentativas consecutivas → mensagem "Muitas tentativas. Aguarde alguns minutos"

## 3. Magic link (link de acesso por e-mail)

- [ ] Solicitar magic link → e-mail chega dentro de 1–2 minutos
- [ ] Clicar no link antes de expirar → redireciona para `/dashboard` autenticado
- [ ] Clicar no link expirado → mensagem "O link expirou. Solicite um novo link de acesso"
- [ ] Clicar no link usado uma segunda vez → trata como expirado ou redireciona para login

## 4. Recuperação de senha

- [ ] Solicitar recuperação → e-mail chega com link de redefinição
- [ ] Clicar no link e definir nova senha válida → login bem-sucedido
- [ ] Clicar no link expirado → mensagem "O link expirou. Solicite um novo link de acesso"
- [ ] Definir senha igual à atual → mensagem "A nova senha deve ser diferente da senha atual"

## 5. Segurança do callback (`/auth/callback`)

- [ ] URL com `?next=/dashboard` → redireciona para `/dashboard`
- [ ] URL com `?next=//evil.com` → redireciona para `/dashboard` (não para o domínio externo)
- [ ] URL com `?next=https://evil.com` → redireciona para `/dashboard`
- [ ] URL com `?next=/checklist` → redireciona para `/checklist`
- [ ] Código OAuth inválido ou ausente → redireciona para `/login?error=callback`

## 6. Sessão e logout

- [ ] Recarregar página com sessão válida → permanece autenticado
- [ ] Logout → redireciona para `/` ou `/login`, sessão encerrada
- [ ] Sessão expirada → redireciona para login sem tela de erro quebrada
- [ ] Dois abas — logout em uma → outra também perde sessão (ou ao navegar)

## 7. Exclusão de conta

- [ ] Fluxo de exclusão de conta → solicita confirmação antes de deletar
- [ ] Após exclusão → dados locais limpos, sessão encerrada, redireciona para início
- [ ] Tentar logar com conta excluída → mensagem de erro adequada

## 8. Modo convidado (sem conta)

- [ ] Acessar `/questionario` sem conta → flui normalmente
- [ ] Dados salvos no localStorage → persist entre navegações sem autenticação
- [ ] Criar conta depois de usar como convidado → dados locais permanecem (não são perdidos)

---

## Observações

- Testar em modo anônimo/privado do navegador para evitar cookies de sessão anterior
- Testar no mobile (iOS Safari e Android Chrome) para verificar redirecionamentos de magic link
- Em staging: variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` devem apontar para o projeto correto
- Magic link expira em 1 hora por padrão no Supabase — testar expiração com link guardado ou configurando TTL menor no dashboard Supabase
