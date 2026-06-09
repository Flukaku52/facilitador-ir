-- Remove execução direta da função de rate limit pelos roles de cliente.
-- A função deve ser chamada apenas pelo servidor usando service_role.
--
-- Contexto: o Supabase aplica ALTER DEFAULT PRIVILEGES que re-concede ALL
-- em funções novas para 'anon' e 'authenticated'. Este arquivo desfaz isso
-- explicitamente, após a migration 20260609120000_create_ask_usage.sql.

REVOKE ALL
  ON FUNCTION public.check_and_increment_ask_usage(text, text, integer, integer)
  FROM anon;

REVOKE ALL
  ON FUNCTION public.check_and_increment_ask_usage(text, text, integer, integer)
  FROM authenticated;

GRANT EXECUTE
  ON FUNCTION public.check_and_increment_ask_usage(text, text, integer, integer)
  TO service_role;
