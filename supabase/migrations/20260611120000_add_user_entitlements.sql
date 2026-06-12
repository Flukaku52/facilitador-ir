-- Premium fase 1 (liberação manual): flag por usuário, somente leitura para o próprio usuário.
-- Escrita apenas via service role / SQL Editor (nenhuma policy de INSERT/UPDATE/DELETE).

CREATE TABLE IF NOT EXISTS user_entitlements (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  is_premium boolean NOT NULL DEFAULT false,
  -- NULL = sem expiração (ativo enquanto is_premium = true).
  -- Com data: ativo até premium_until (inclusive), comparação por dia.
  premium_until date,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entitlement"
  ON user_entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- Reaproveita a função já criada em supabase/schema.sql
CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON user_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
