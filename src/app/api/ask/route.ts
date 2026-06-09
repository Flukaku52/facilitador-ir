import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { env } from '@/env';
import {
  checkAskRateLimit,
  extractIdentifier,
  validateQuestion,
  shouldBlockWithoutRateLimit,
} from '@/lib/rate-limit/ask-rate-limit';

export async function POST(request: Request) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'O assistente IA está temporariamente indisponível. O restante do aplicativo funciona normalmente.' },
      { status: 503 },
    );
  }

  // ── parse e valida o corpo ─────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  }

  const { question, profile } = body as { question: unknown; profile: unknown };
  const validation = validateQuestion(question);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  // ── rate limiting via Supabase ─────────────────────────────────────────────
  const supabaseUrl      = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey  = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseAdminKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseAdminKey);

  // Em produção sem Supabase configurado: bloqueia com erro controlado.
  // Em dev local sem Supabase: permite continuar sem rate limit.
  if (shouldBlockWithoutRateLimit(env.NODE_ENV, supabaseConfigured)) {
    return NextResponse.json(
      { error: 'O assistente IA está temporariamente indisponível. Tente novamente mais tarde.' },
      { status: 503 },
    );
  }

  if (supabaseConfigured) {
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const supabaseAuth = createServerClient(supabaseUrl!, supabaseAnonKey!, {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            ),
        },
      });
      const { data: { user } } = await supabaseAuth.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      // Auth check failed — trata como convidado e continua com limites de IP
    }

    const { identifier, identifierType } = extractIdentifier(request, userId);
    const admin = createSupabaseAdmin(supabaseUrl!, supabaseAdminKey!);
    const result = await checkAskRateLimit(admin, identifier, identifierType);

    if (!result.allowed) {
      if (result.reason === 'db_error') {
        return NextResponse.json(
          { error: 'O assistente IA está temporariamente indisponível. Tente novamente em alguns minutos.' },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { error: 'Você atingiu o limite de perguntas por enquanto. Tente novamente mais tarde.' },
        { status: 429 },
      );
    }
  }

  // ── chama a API da Anthropic ───────────────────────────────────────────────
  try {
    const client = new Anthropic({ apiKey });
    const profileSummary = profile ? JSON.stringify(profile) : 'Perfil não disponível';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `Você é um assistente educacional tributário do IR Facilitador, um aplicativo que ajuda brasileiros a organizarem sua Declaração de Imposto de Renda Pessoa Física (IRPF).

O perfil tributário do usuário (extraído das respostas do questionário) é:
${profileSummary}

Diretrizes:
- Responda de forma simples, clara e sem juridiquês
- Use linguagem acessível para quem não é especialista em impostos
- Para casos complexos, sempre recomende revisão com um contador
- Nunca garanta certeza absoluta sobre regras tributárias — elas mudam anualmente
- Seja objetivo: limite a resposta a no máximo 4 parágrafos
- Se não souber a resposta com segurança, diga isso claramente

AVISO LEGAL: Você fornece apenas orientação educacional. Não substitui contador, advogado ou a Receita Federal. A responsabilidade final é sempre do contribuinte.`,
      messages: [{ role: 'user', content: validation.value }],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    const answer = textBlock?.type === 'text' ? textBlock.text : '';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('[/api/ask] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao processar sua pergunta. Tente novamente.' },
      { status: 500 },
    );
  }
}
