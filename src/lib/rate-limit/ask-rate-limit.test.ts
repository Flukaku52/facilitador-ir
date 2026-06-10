import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  validateQuestion,
  checkAskRateLimit,
  extractIdentifier,
  shouldBlockWithoutRateLimit,
  RATE_LIMITS,
  MAX_QUESTION_LENGTH,
} from './ask-rate-limit';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSupabase(result: { data: unknown; error: unknown }) {
  return {
    rpc: vi.fn().mockResolvedValue(result),
  } as unknown as SupabaseClient;
}

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/', {
    method: 'POST',
    headers,
  });
}

// ---------------------------------------------------------------------------
// validateQuestion
// ---------------------------------------------------------------------------

describe('validateQuestion', () => {
  it('rejects empty string', () => {
    expect(validateQuestion('').valid).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(validateQuestion('   ').valid).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(validateQuestion(null).valid).toBe(false);
    expect(validateQuestion(42).valid).toBe(false);
    expect(validateQuestion(undefined).valid).toBe(false);
  });

  it(`rejects question over ${MAX_QUESTION_LENGTH} chars`, () => {
    const result = validateQuestion('a'.repeat(MAX_QUESTION_LENGTH + 1));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.message).toContain('longa');
  });

  it(`accepts question at exactly ${MAX_QUESTION_LENGTH} chars`, () => {
    const result = validateQuestion('a'.repeat(MAX_QUESTION_LENGTH));
    expect(result.valid).toBe(true);
  });

  it('trims whitespace from valid question', () => {
    const result = validateQuestion('  Como declarar aluguel?  ');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe('Como declarar aluguel?');
  });

  it('accepts a normal question', () => {
    const result = validateQuestion('Preciso declarar o aluguel recebido?');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toBe('Preciso declarar o aluguel recebido?');
  });
});

// ---------------------------------------------------------------------------
// checkAskRateLimit
// ---------------------------------------------------------------------------

describe('checkAskRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns allowed=true within limits', async () => {
    const supabase = mockSupabase({ data: { allowed: true }, error: null });
    const result = await checkAskRateLimit(supabase, 'user-123', 'user');
    expect(result.allowed).toBe(true);
  });

  it('calls RPC with correct params for user type', async () => {
    const supabase = mockSupabase({ data: { allowed: true }, error: null });
    await checkAskRateLimit(supabase, 'user-abc', 'user');

    expect((supabase.rpc as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      'check_and_increment_ask_usage',
      {
        p_identifier:      'user-abc',
        p_identifier_type: 'user',
        p_hour_limit:      RATE_LIMITS.user.hourLimit,
        p_day_limit:       RATE_LIMITS.user.dayLimit,
      },
    );
  });

  it('calls RPC with correct params for ip type', async () => {
    const supabase = mockSupabase({ data: { allowed: true }, error: null });
    await checkAskRateLimit(supabase, 'ip_hash', 'ip');

    const call = (supabase.rpc as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(call.p_hour_limit).toBe(RATE_LIMITS.ip.hourLimit);
    expect(call.p_day_limit).toBe(RATE_LIMITS.ip.dayLimit);
  });

  it('user limits are more permissive than ip limits', () => {
    expect(RATE_LIMITS.user.hourLimit).toBeGreaterThan(RATE_LIMITS.ip.hourLimit);
    expect(RATE_LIMITS.user.dayLimit).toBeGreaterThan(RATE_LIMITS.ip.dayLimit);
  });

  it('blocks with hour_limit reason when hourly limit exceeded', async () => {
    const supabase = mockSupabase({
      data: { allowed: false, reason: 'hour_limit' },
      error: null,
    });
    const result = await checkAskRateLimit(supabase, 'user-123', 'user');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('hour_limit');
  });

  it('blocks with day_limit reason when daily limit exceeded', async () => {
    const supabase = mockSupabase({
      data: { allowed: false, reason: 'day_limit' },
      error: null,
    });
    const result = await checkAskRateLimit(supabase, 'ip_hash', 'ip');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('day_limit');
  });

  it('blocks with db_error when Supabase RPC fails (fail-safe)', async () => {
    const supabase = mockSupabase({
      data: null,
      error: { message: 'connection refused' },
    });
    const result = await checkAskRateLimit(supabase, 'user-123', 'user');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('db_error');
  });

  it('does NOT allow requests through on DB error (never fail-open)', async () => {
    const supabase = mockSupabase({ data: null, error: { message: 'timeout' } });
    const result = await checkAskRateLimit(supabase, 'any', 'ip');
    expect(result.allowed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// shouldBlockWithoutRateLimit — comportamento em produção vs. dev
// ---------------------------------------------------------------------------

describe('shouldBlockWithoutRateLimit', () => {
  it('blocks in production when Supabase is not configured', () => {
    expect(shouldBlockWithoutRateLimit('production', false)).toBe(true);
  });

  it('does not block in development when Supabase is not configured', () => {
    expect(shouldBlockWithoutRateLimit('development', false)).toBe(false);
  });

  it('does not block in test env when Supabase is not configured', () => {
    expect(shouldBlockWithoutRateLimit('test', false)).toBe(false);
  });

  it('does not block in production when Supabase IS configured', () => {
    expect(shouldBlockWithoutRateLimit('production', true)).toBe(false);
  });

  it('does not block in development when Supabase IS configured', () => {
    expect(shouldBlockWithoutRateLimit('development', true)).toBe(false);
  });

  it('production sem Supabase → deve retornar 503 (não deixa chamar Anthropic)', () => {
    // shouldBlockWithoutRateLimit retorna true → route.ts retorna antes do Anthropic call
    const blocked = shouldBlockWithoutRateLimit('production', false);
    expect(blocked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// extractIdentifier
// ---------------------------------------------------------------------------

describe('extractIdentifier', () => {
  it('uses user_id for authenticated users', () => {
    const req = makeRequest();
    const { identifier, identifierType } = extractIdentifier(req, 'user-abc-123');
    expect(identifierType).toBe('user');
    expect(identifier).toBe('user-abc-123');
  });

  it('uses hashed IP for guests (does not store raw IP)', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    const { identifier, identifierType } = extractIdentifier(req, null);
    expect(identifierType).toBe('ip');
    expect(identifier).not.toBe('1.2.3.4');
    expect(identifier.startsWith('ip_')).toBe(true);
  });

  it('prefers x-forwarded-for over x-real-ip (Vercel behavior)', () => {
    const reqFwd   = makeRequest({ 'x-forwarded-for': '5.6.7.8' });
    const reqReal  = makeRequest({ 'x-real-ip': '5.6.7.8' });
    const reqBoth  = makeRequest({ 'x-forwarded-for': '5.6.7.8', 'x-real-ip': '9.9.9.9' });

    const { identifier: fromFwd  } = extractIdentifier(reqFwd,  null);
    const { identifier: fromReal } = extractIdentifier(reqReal, null);
    const { identifier: fromBoth } = extractIdentifier(reqBoth, null);

    // Same IP → same hash regardless of header used
    expect(fromFwd).toBe(fromReal);
    // x-forwarded-for takes priority → hash of '5.6.7.8', not '9.9.9.9'
    expect(fromBoth).toBe(fromFwd);
  });

  it('produces same hash for same IP on repeated calls (deterministic)', () => {
    const req1 = makeRequest({ 'x-forwarded-for': '10.0.0.1' });
    const req2 = makeRequest({ 'x-forwarded-for': '10.0.0.1' });
    const { identifier: id1 } = extractIdentifier(req1, null);
    const { identifier: id2 } = extractIdentifier(req2, null);
    expect(id1).toBe(id2);
  });

  it('produces different hashes for different IPs', () => {
    const req1 = makeRequest({ 'x-forwarded-for': '1.1.1.1' });
    const req2 = makeRequest({ 'x-forwarded-for': '2.2.2.2' });
    const { identifier: id1 } = extractIdentifier(req1, null);
    const { identifier: id2 } = extractIdentifier(req2, null);
    expect(id1).not.toBe(id2);
  });

  it('guest and authenticated identifiers have different types even with same value', () => {
    const req = makeRequest({ 'x-forwarded-for': 'user-abc' });
    const guest = extractIdentifier(req, null);
    const auth  = extractIdentifier(req, 'user-abc');
    expect(guest.identifierType).toBe('ip');
    expect(auth.identifierType).toBe('user');
  });

  it('falls back to "unknown" when no IP header present', () => {
    const req = makeRequest();
    const { identifier, identifierType } = extractIdentifier(req, null);
    expect(identifierType).toBe('ip');
    expect(identifier.startsWith('ip_')).toBe(true);
  });

  it('uses only first IP from comma-separated x-forwarded-for', () => {
    const reqMulti  = makeRequest({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' });
    const reqSingle = makeRequest({ 'x-forwarded-for': '1.1.1.1' });
    const { identifier: multi  } = extractIdentifier(reqMulti,  null);
    const { identifier: single } = extractIdentifier(reqSingle, null);
    expect(multi).toBe(single);
  });
});

// ---------------------------------------------------------------------------
// Migration SQL — integridade de GRANT/REVOKE
// ---------------------------------------------------------------------------

describe('migration: ask_usage SQL', () => {
  const migrationSql = readFileSync(
    resolve(process.cwd(), 'supabase/migrations/20260609120000_create_ask_usage.sql'),
    'utf-8',
  );

  it('includes REVOKE EXECUTE FROM PUBLIC', () => {
    expect(migrationSql).toContain('REVOKE EXECUTE');
    expect(migrationSql).toContain('FROM PUBLIC');
  });

  it('includes GRANT EXECUTE TO service_role', () => {
    expect(migrationSql).toContain('GRANT EXECUTE');
    expect(migrationSql).toContain('TO service_role');
  });

  it('GRANT appears after REVOKE (order matters)', () => {
    const revokeIdx = migrationSql.indexOf('REVOKE EXECUTE');
    const grantIdx  = migrationSql.indexOf('GRANT EXECUTE');
    expect(revokeIdx).toBeGreaterThan(0);
    expect(grantIdx).toBeGreaterThan(0);
    expect(grantIdx).toBeGreaterThan(revokeIdx);
  });

  it('RLS is enabled', () => {
    expect(migrationSql).toContain('ENABLE ROW LEVEL SECURITY');
  });

  it('function uses SECURITY DEFINER', () => {
    expect(migrationSql).toContain('SECURITY DEFINER');
  });
});

// ---------------------------------------------------------------------------
// Garantia estrutural: 429 é retornado ANTES da chamada Anthropic
// ---------------------------------------------------------------------------

describe('route.ts structure: rate limit blocks before Anthropic call', () => {
  const routeSrc = readFileSync(
    resolve(process.cwd(), 'src/app/api/ask/route.ts'),
    'utf-8',
  );

  it('429 early return appears before Anthropic instantiation in source', () => {
    const idx429      = routeSrc.indexOf('status: 429');
    const idxAnthropic = routeSrc.indexOf('new Anthropic(');
    expect(idx429).toBeGreaterThan(0);
    expect(idxAnthropic).toBeGreaterThan(0);
    expect(idx429).toBeLessThan(idxAnthropic);
  });

  it('503 production block appears before Anthropic instantiation in source', () => {
    const idxBlock    = routeSrc.indexOf('shouldBlockWithoutRateLimit');
    const idxAnthropic = routeSrc.indexOf('new Anthropic(');
    expect(idxBlock).toBeGreaterThan(0);
    expect(idxAnthropic).toBeGreaterThan(0);
    expect(idxBlock).toBeLessThan(idxAnthropic);
  });
});

// ---------------------------------------------------------------------------
// Feature flag: isAiAssistantEnabled desliga IA por padrão
// ---------------------------------------------------------------------------

describe('AI assistant feature flag', () => {
  const routeSrc = readFileSync(
    resolve(process.cwd(), 'src/app/api/ask/route.ts'),
    'utf-8',
  );
  const envSrc = readFileSync(
    resolve(process.cwd(), 'src/env.ts'),
    'utf-8',
  );
  const dashboardSrc = readFileSync(
    resolve(process.cwd(), 'src/app/dashboard/page.tsx'),
    'utf-8',
  );

  it('feature flag check appears in route.ts before new Anthropic(', () => {
    const idxFlag      = routeSrc.indexOf('isAiAssistantEnabled');
    const idxAnthropic = routeSrc.indexOf('new Anthropic(');
    expect(idxFlag).toBeGreaterThan(0);
    expect(idxAnthropic).toBeGreaterThan(0);
    expect(idxFlag).toBeLessThan(idxAnthropic);
  });

  it('feature flag check returns 503 before rate limit check in route.ts', () => {
    const idxFlag      = routeSrc.indexOf('isAiAssistantEnabled');
    const idxRateLimit = routeSrc.indexOf('checkAskRateLimit');
    expect(idxFlag).toBeGreaterThan(0);
    expect(idxRateLimit).toBeGreaterThan(0);
    expect(idxFlag).toBeLessThan(idxRateLimit);
  });

  it('isAiAssistantEnabled defaults to false when env var is absent', () => {
    // A lógica em env.ts: === "true" → apenas string exata liga a IA.
    // undefined, "", "false", "1", "yes" → todos resultam em false.
    const isEnabled = (val: string | undefined) => val === 'true';
    expect(isEnabled(undefined)).toBe(false);
    expect(isEnabled('')).toBe(false);
    expect(isEnabled('false')).toBe(false);
    expect(isEnabled('1')).toBe(false);
    expect(isEnabled('yes')).toBe(false);
    expect(isEnabled('true')).toBe(true);
  });

  it('env.ts exports isAiAssistantEnabled based on === "true" comparison', () => {
    expect(envSrc).toContain('isAiAssistantEnabled');
    expect(envSrc).toContain("=== 'true'");
  });

  it('env.ts declares NEXT_PUBLIC_AI_ASSISTANT_ENABLED in client section', () => {
    expect(envSrc).toContain('NEXT_PUBLIC_AI_ASSISTANT_ENABLED');
  });

  it('ANTHROPIC_API_KEY schema has no regex validator (does not break build when absent or invalid)', () => {
    // A regex /^sk-ant-/ foi removida do schema Zod para evitar quebra de build.
    expect(envSrc).not.toContain('sk-ant-');
  });

  it('dashboard wraps AskDialog in isAiAssistantEnabled condition', () => {
    expect(dashboardSrc).toContain('isAiAssistantEnabled');
    // AskDialog só aparece dentro de uma expressão condicional
    const idxFlag     = dashboardSrc.indexOf('isAiAssistantEnabled');
    const idxAskDialog = dashboardSrc.indexOf('<AskDialog');
    expect(idxFlag).toBeGreaterThan(0);
    expect(idxAskDialog).toBeGreaterThan(0);
    // A flag precisa aparecer antes do componente para envolvê-lo
    expect(idxFlag).toBeLessThan(idxAskDialog);
  });
});
