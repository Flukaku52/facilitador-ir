'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export type AuthError = {
  message: string;
};

export function translateAuthError(error: { message: string }): AuthError {
  const msg = error.message.toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return { message: 'E-mail ou senha incorretos.' };
  }
  if (msg.includes('email not confirmed')) {
    return { message: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' };
  }
  if (
    msg.includes('user already registered') ||
    msg.includes('already been registered') ||
    msg.includes('already registered')
  ) {
    return { message: 'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.' };
  }
  if (
    (msg.includes('password') && (msg.includes('short') || msg.includes('weak'))) ||
    msg.includes('at least 8')
  ) {
    return { message: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('over_email_send_rate_limit')
  ) {
    return { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' };
  }
  if (
    (msg.includes('email') && msg.includes('invalid')) ||
    msg.includes('unable to validate email')
  ) {
    return { message: 'E-mail inválido. Verifique o endereço e tente novamente.' };
  }
  if (
    msg.includes('network') ||
    msg.includes('fetch failed') ||
    msg.includes('connection')
  ) {
    return { message: 'Erro de conexão. Verifique sua internet e tente novamente.' };
  }
  if (msg.includes('new password should be different')) {
    return { message: 'A nova senha deve ser diferente da senha atual.' };
  }
  if (
    msg.includes('otp_expired') ||
    msg.includes('token has expired') ||
    (msg.includes('token') && msg.includes('expired'))
  ) {
    return { message: 'O link expirou. Solicite um novo link de acesso.' };
  }
  if (msg.includes('signup_disabled')) {
    return { message: 'O cadastro está temporariamente desativado. Tente novamente mais tarde.' };
  }

  return { message: 'Ocorreu um erro inesperado. Tente novamente.' };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // loading=true only when Supabase is configured (we need to wait for getSession)
  const [loading, setLoading] = useState(
    () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );

  useEffect(() => {
    // Guest mode: Supabase not configured, no auth to initialize
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    let mounted = true;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: name ? { name } : undefined,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw translateAuthError(error);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw translateAuthError(error);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const supabase = createClient();
    // Redirect after code exchange goes to /recuperar-senha?mode=reset (set new password form)
    const next = encodeURIComponent('/recuperar-senha?mode=reset');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
    });
    if (error) throw translateAuthError(error);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw translateAuthError(error);
  }, []);

  return { user, loading, signUp, signIn, signOut, requestPasswordReset, updatePassword };
}
