import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // Regex removida do schema: validação de formato ocorre em runtime na rota,
    // apenas quando AI_ASSISTANT está habilitado. Evita quebra de build quando
    // a key está ausente ou com valor inválido na Vercel.
    ANTHROPIC_API_KEY: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    // Sem env var ou com qualquer valor diferente de "true" = IA desligada.
    NEXT_PUBLIC_AI_ASSISTANT_ENABLED: z.string().optional(),
  },
  runtimeEnv: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || undefined,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined,
    NEXT_PUBLIC_AI_ASSISTANT_ENABLED: process.env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED || undefined,
  },
});

export const isAiAssistantEnabled =
  env.NEXT_PUBLIC_AI_ASSISTANT_ENABLED === 'true';
