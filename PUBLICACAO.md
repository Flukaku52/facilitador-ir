# Preparação para Publicação e Monetização — IR Facilitador

Documento de referência para a transição de beta privado para produto público e potencialmente pago.

---

## Estado atual (após sprint "product-readiness-final-pass")

| Dimensão | Status |
|---|---|
| Funcionalidade MVP | Completo |
| Autenticação Supabase | Operacional |
| Sincronização na nuvem | Operacional |
| PDF nativo | Operacional |
| Assistente IA (`/api/ask`) | Operacional |
| Testes automatizados | 269 testes, 100% passing |
| Build de produção | OK |
| Deploy (Vercel) | Ativo |
| Políticas legais (termos + privacidade) | Publicadas — revisar antes de abertura pública |
| Disclaimer fiscal | Presente nas páginas críticas |

---

## Modelo de planos sugerido (a validar com usuários)

### Plano Gratuito — "Organize seu IR"
- Diagnóstico completo (questionário + checklist personalizado)
- Acesso a todos os guias educativos (20 guias)
- Relatório de perfil e alertas
- Compartilhamento de relatório por link
- Salvo no navegador (localStorage) sem conta

### Plano Conta (gratuito) — "IR na nuvem"
- Tudo do plano gratuito
- Sync na nuvem (Supabase) — dados em todos os dispositivos
- Histórico entre anos-base

### Plano Pro (pago, a definir preço) — "IR Assistido"
- Tudo do Plano Conta
- Assistente IA ilimitado (atualmente limitado por custo da API Claude)
- PDF com marca personalizada ou sem branding
- Suporte prioritário

**Restrição importante:** Nunca prometer resultado fiscal específico (restituição, isenção, cálculo de imposto) em nenhum plano.

---

## Blockers antes de abertura pública

### Obrigatórios

1. **Revisão jurídica dos Termos de Uso e Política de Privacidade**
   - Verificar conformidade com LGPD (Lei 13.709/2018)
   - Confirmar cláusulas de limitação de responsabilidade fiscal
   - Verificar adequação para menores de idade (não coletar dados de menores sem consentimento parental)

2. **Definição de retenção de dados**
   - Prazo atual: sem política formal além de "30 dias de backup Supabase"
   - Precisar política: quando dados de usuário são deletados após inatividade?
   - Implementar exclusão de conta com remoção efetiva dos dados

3. **Rate limiting no assistente IA**
   - `/api/ask` usa Claude API sem limite por usuário
   - Custo pode escalar rapidamente com usuários públicos
   - Implementar: N perguntas/dia para plano gratuito, ilimitado para Pro

4. **Monitoramento de erros em produção**
   - Sem Sentry ou equivalente ainda
   - Erros silenciosos no PDF, IA e auth não são rastreados
   - Recomendação: Sentry free tier antes da abertura pública

5. **Atualização anual dos thresholds fiscais**
   - `src/lib/rules/thresholds.ts` tem valores para 2025 e 2026
   - Precisar processo para atualizar anualmente com fonte oficial (Receita Federal / Diário Oficial)
   - Incluir data-source e link no próprio arquivo de thresholds

### Recomendados (não bloqueantes)

6. **Testes manuais de auth com checklist `TESTE_MANUAL_AUTH.md`** antes da abertura
7. **Smoke test do PDF** com perfis: simples, médio e complexo (todos os campos verdadeiros)
8. **Teste de compartilhamento de link** — gerar link em produção e verificar decode correto
9. **Testes em mobile** (iOS Safari, Android Chrome) — redirecionamento de magic link
10. **Dark mode** — verificar todas as páginas em modo escuro

---

## Riscos LGPD conhecidos

| Risco | Severidade | Mitigação atual |
|---|---|---|
| Dados fiscais sensíveis no Supabase sem criptografia em campo | Média | RLS + TLS + sem CPF/CNPJ real armazenado |
| Notas locais com informações pessoais não sobem para nuvem | Baixa | Documentado em privacidade |
| Backup do Supabase (30 dias) retém dados de usuários deletados | Média | Documentado na política de privacidade |
| Logs de API (Vercel/Supabase) podem conter tokens | Baixa | Padrão de produção; não logamos payload |
| Usuário menor de idade sem controle | Alta | Implementar declaração de maioridade no cadastro |

---

## Precificação — referências de mercado

*Nota: valores hipotéticos. Validar com pesquisa de usuários antes de publicar.*

| Modelo | Referência |
|---|---|
| Freemium com Pro pago | Notion, Calendly — funcionalidade básica grátis, recursos avançados pagos |
| Assinatura anual única | Faz sentido no contexto fiscal (usuário precisa uma vez por ano) |
| Preço sugerido para validar | R$ 29–49/ano para Pro (comparable a 1h de contador) |
| Diferencial | Não é software de declaração (não compete com PGD da Receita) — é organizador |

---

## Checklist de lançamento público

- [ ] Revisão jurídica dos Termos e Política de Privacidade concluída
- [ ] Rate limiting no `/api/ask` implementado
- [ ] Monitoramento de erros (Sentry ou equivalente) configurado
- [ ] Política de retenção de dados definida e implementada
- [ ] Smoke tests manuais (auth, PDF, share link) aprovados
- [ ] Testes em mobile aprovados
- [ ] Thresholds fiscais do ano vigente conferidos com fonte oficial
- [ ] Declaração de maioridade no cadastro (ou age gate)
- [ ] Suporte mínimo definido (e-mail? formulário?)
- [ ] Página de status ou página de manutenção configurada

---

## Apêndice A — Multi-ano / múltiplos perfis

O `TaxProfile` já carrega o campo `taxYear`. O que falta para suportar múltiplos anos:

- Armazenamento local: chave por ano (ex: `ir_facilitador_profile_2025`)
- UI: seletor de ano na tela de diagnóstico e no painel
- Lógica: `thresholds.ts` já tem suporte a anos distintos

**Estimativa:** 1–2 sprints de engenharia. Não bloqueante para lançamento.

## Apêndice B — Upload de documentos

Placeholder de funcionalidade futura. Escopo estimado:

- Upload de PDF/imagem por item do checklist
- Armazenamento: Supabase Storage com bucket por usuário
- Extração de texto: OCR (ex: Tesseract ou API de terceiros)
- Vinculação: `ChecklistItem.documentUrl`

**Bloqueante:** Precisa da política de retenção de dados, consentimento explícito para armazenamento de documentos fiscais, e revisão legal adicional.

**Estimativa:** 3–4 sprints. Pós-lançamento público.
