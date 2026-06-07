import { describe, it, expect } from 'vitest';
import { translateAuthError } from './useAuth';

describe('translateAuthError', () => {
  it('handles invalid login credentials', () => {
    expect(translateAuthError({ message: 'Invalid login credentials' }).message).toBe(
      'E-mail ou senha incorretos.',
    );
  });

  it('handles invalid credentials (alternate form)', () => {
    expect(translateAuthError({ message: 'Invalid credentials provided' }).message).toBe(
      'E-mail ou senha incorretos.',
    );
  });

  it('handles unconfirmed email', () => {
    expect(translateAuthError({ message: 'Email not confirmed' }).message).toBe(
      'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
    );
  });

  it('handles already registered user', () => {
    expect(translateAuthError({ message: 'User already registered' }).message).toBe(
      'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.',
    );
  });

  it('handles already been registered (alternate form)', () => {
    expect(translateAuthError({ message: 'Email address already been registered' }).message).toBe(
      'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.',
    );
  });

  it('handles weak password', () => {
    expect(
      translateAuthError({ message: 'Password should contain at least 8 characters' }).message,
    ).toBe('A senha deve ter pelo menos 8 caracteres.');
  });

  it('handles short password', () => {
    expect(translateAuthError({ message: 'Password is too short' }).message).toBe(
      'A senha deve ter pelo menos 8 caracteres.',
    );
  });

  it('handles rate limit (over_email_send_rate_limit)', () => {
    expect(translateAuthError({ message: 'over_email_send_rate_limit' }).message).toBe(
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    );
  });

  it('handles too many requests', () => {
    expect(translateAuthError({ message: 'Too many requests' }).message).toBe(
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    );
  });

  it('handles rate limit exceeded', () => {
    expect(translateAuthError({ message: 'Email rate limit exceeded' }).message).toBe(
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    );
  });

  it('handles invalid email format', () => {
    expect(translateAuthError({ message: 'Unable to validate email address: invalid format' }).message).toBe(
      'E-mail inválido. Verifique o endereço e tente novamente.',
    );
  });

  it('handles invalid email (alternate form)', () => {
    expect(translateAuthError({ message: 'Email is invalid' }).message).toBe(
      'E-mail inválido. Verifique o endereço e tente novamente.',
    );
  });

  it('handles network/fetch error', () => {
    expect(translateAuthError({ message: 'fetch failed' }).message).toBe(
      'Erro de conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('handles connection error', () => {
    expect(translateAuthError({ message: 'Network connection error' }).message).toBe(
      'Erro de conexão. Verifique sua internet e tente novamente.',
    );
  });

  it('handles same password error', () => {
    expect(
      translateAuthError({ message: 'New password should be different from the current password' }).message,
    ).toBe('A nova senha deve ser diferente da senha atual.');
  });

  it('returns generic message for unknown errors', () => {
    expect(translateAuthError({ message: 'some_unknown_supabase_error_code' }).message).toBe(
      'Ocorreu um erro inesperado. Tente novamente.',
    );
  });

  it('is case-insensitive', () => {
    expect(translateAuthError({ message: 'INVALID LOGIN CREDENTIALS' }).message).toBe(
      'E-mail ou senha incorretos.',
    );
  });
});
