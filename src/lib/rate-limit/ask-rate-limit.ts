import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

export type IdentifierType = 'user' | 'ip';

export interface RateLimitConfig {
  hourLimit: number;
  dayLimit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: 'hour_limit' | 'day_limit' | 'db_error';
}

export const RATE_LIMITS: Record<IdentifierType, RateLimitConfig> = {
  user: { hourLimit: 20, dayLimit: 50 },
  ip:   { hourLimit: 5,  dayLimit: 10 },
};

export const MAX_QUESTION_LENGTH = 500;

export function validateQuestion(
  question: unknown,
): { valid: true; value: string } | { valid: false; message: string } {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return { valid: false, message: 'Pergunta inválida.' };
  }
  if (question.trim().length > MAX_QUESTION_LENGTH) {
    return { valid: false, message: `Pergunta muito longa. Máximo ${MAX_QUESTION_LENGTH} caracteres.` };
  }
  return { valid: true, value: question.trim() };
}

export async function checkAskRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  identifierType: IdentifierType,
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[identifierType];

  const { data, error } = await supabase.rpc('check_and_increment_ask_usage', {
    p_identifier:      identifier,
    p_identifier_type: identifierType,
    p_hour_limit:      config.hourLimit,
    p_day_limit:       config.dayLimit,
  });

  if (error) {
    // Fail-safe: bloqueia se não conseguir verificar o limite
    console.error('[rate-limit] Erro ao verificar limite:', error.message);
    return { allowed: false, reason: 'db_error' };
  }

  return data as RateLimitResult;
}

export function extractIdentifier(
  request: Request,
  userId: string | null,
): { identifier: string; identifierType: IdentifierType } {
  if (userId) {
    return { identifier: userId, identifierType: 'user' };
  }
  const rawIp =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';
  return { identifier: hashIp(rawIp), identifierType: 'ip' };
}

function hashIp(ip: string): string {
  return 'ip_' + createHash('sha256').update(ip).digest('hex').slice(0, 24);
}
