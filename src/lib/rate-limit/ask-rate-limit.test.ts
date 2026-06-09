import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  validateQuestion,
  checkAskRateLimit,
  extractIdentifier,
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
    // Fail-safe: DB error must block, never allow
    expect(result.allowed).toBe(false);
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

  it('prefers x-real-ip over x-forwarded-for', () => {
    const reqReal  = makeRequest({ 'x-real-ip': '5.6.7.8' });
    const reqFwd   = makeRequest({ 'x-forwarded-for': '5.6.7.8' });
    const reqBoth  = makeRequest({ 'x-real-ip': '5.6.7.8', 'x-forwarded-for': '9.9.9.9' });

    const { identifier: fromReal } = extractIdentifier(reqReal, null);
    const { identifier: fromFwd  } = extractIdentifier(reqFwd,  null);
    const { identifier: fromBoth } = extractIdentifier(reqBoth, null);

    // Same IP → same hash
    expect(fromReal).toBe(fromFwd);
    // x-real-ip takes priority → same hash as fromReal, not 9.9.9.9
    expect(fromBoth).toBe(fromReal);
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
