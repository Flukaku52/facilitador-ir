import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/env';

export async function POST(request: Request) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'O assistente IA está temporariamente indisponível. O restante do aplicativo funciona normalmente.' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { question, profile } = body as { question: string; profile: unknown };

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Pergunta inválida.' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey });

    const profileSummary = profile
      ? JSON.stringify(profile)
      : 'Perfil não disponível';

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
      messages: [{ role: 'user', content: question.trim() }],
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
