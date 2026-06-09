-- ATENÇÃO: NÃO aplicar no Supabase remoto sem aprovação prévia.
-- Esta migration é local apenas. Aplicar via: supabase db push (quando autorizado).

-- Tabela de uso do assistente IA para rate limiting centralizado
CREATE TABLE IF NOT EXISTS ask_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  identifier_type text NOT NULL CHECK (identifier_type IN ('user', 'ip')),
  window_type text NOT NULL CHECK (window_type IN ('hour', 'day')),
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 1 CHECK (count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ask_usage_unique_window
    UNIQUE (identifier, identifier_type, window_type, window_start)
  -- O UNIQUE constraint já cria um índice B-tree implícito nas mesmas colunas.
  -- Não há índice separado para lookup: o índice da constraint é suficiente.
);

-- Índice para facilitar limpeza de registros antigos (uso futuro)
CREATE INDEX IF NOT EXISTS idx_ask_usage_window_start
  ON ask_usage (window_start);

-- RLS: nenhum cliente pode ler ou escrever diretamente;
-- somente o service_role (server-side) opera via RPC abaixo.
ALTER TABLE ask_usage ENABLE ROW LEVEL SECURITY;
-- (sem políticas = acesso negado para anon e authenticated)

-- ---------------------------------------------------------------------------
-- Função: check_and_increment_ask_usage
-- Verifica e incrementa o contador de uso numa única operação de banco.
-- Retorna { allowed: bool, reason?: "hour_limit"|"day_limit" }
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_and_increment_ask_usage(
  p_identifier      text,
  p_identifier_type text,
  p_hour_limit      integer,
  p_day_limit       integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hour_start timestamptz := date_trunc('hour', now());
  v_day_start  timestamptz := date_trunc('day', now());
  v_hour_count integer := 0;
  v_day_count  integer := 0;
BEGIN
  -- Lê contagem atual da janela horária
  SELECT count INTO v_hour_count
  FROM ask_usage
  WHERE identifier      = p_identifier
    AND identifier_type = p_identifier_type
    AND window_type     = 'hour'
    AND window_start    = v_hour_start;

  IF COALESCE(v_hour_count, 0) >= p_hour_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'hour_limit');
  END IF;

  -- Lê contagem atual da janela diária
  SELECT count INTO v_day_count
  FROM ask_usage
  WHERE identifier      = p_identifier
    AND identifier_type = p_identifier_type
    AND window_type     = 'day'
    AND window_start    = v_day_start;

  IF COALESCE(v_day_count, 0) >= p_day_limit THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'day_limit');
  END IF;

  -- Incrementa ambas as janelas atomicamente
  INSERT INTO ask_usage (identifier, identifier_type, window_type, window_start, count)
  VALUES
    (p_identifier, p_identifier_type, 'hour', v_hour_start, 1),
    (p_identifier, p_identifier_type, 'day',  v_day_start,  1)
  ON CONFLICT (identifier, identifier_type, window_type, window_start)
  DO UPDATE SET
    count      = ask_usage.count + 1,
    updated_at = now();

  RETURN jsonb_build_object('allowed', true);
END;
$$;

-- Restringe execução direta pelos roles de cliente.
-- service_role NÃO é superuser no Supabase (tem apenas BYPASSRLS), portanto
-- precisa de GRANT explícito após o REVOKE FROM PUBLIC.
REVOKE EXECUTE
  ON FUNCTION check_and_increment_ask_usage(text, text, integer, integer)
  FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION check_and_increment_ask_usage(text, text, integer, integer)
  TO service_role;

-- TODO: adicionar job de limpeza de registros com window_start < now() - interval '7 days'
