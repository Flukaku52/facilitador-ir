-- Liberação manual de premium (fase 1) — rodar no SQL Editor do Supabase
-- (executa como service role, ignora RLS). Edite o e-mail antes de rodar.
-- Nada disso é exposto na interface do app.

-- (a) ATIVAR premium SEM expiração (NULL = ativo enquanto is_premium = true):
INSERT INTO user_entitlements (user_id, is_premium, premium_until)
SELECT id, true, NULL
FROM auth.users
WHERE email = 'pessoa@exemplo.com'
ON CONFLICT (user_id) DO UPDATE
  SET is_premium = true, premium_until = NULL, updated_at = now();

-- (b) ATIVAR premium COM data de fim de temporada (ativo até a data, inclusive):
INSERT INTO user_entitlements (user_id, is_premium, premium_until)
SELECT id, true, '2026-05-31'
FROM auth.users
WHERE email = 'pessoa@exemplo.com'
ON CONFLICT (user_id) DO UPDATE
  SET is_premium = true, premium_until = '2026-05-31', updated_at = now();

-- (c) DESATIVAR premium:
UPDATE user_entitlements
SET is_premium = false, updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'pessoa@exemplo.com');

-- Conferir o estado atual de um usuário:
SELECT u.email, e.is_premium, e.premium_until, e.updated_at
FROM user_entitlements e
JOIN auth.users u ON u.id = e.user_id
WHERE u.email = 'pessoa@exemplo.com';
