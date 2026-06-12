import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isPremiumActive,
  PremiumEntitlement,
} from "@/lib/premium/premium-status";
import { getPremiumGuideSections } from "@/lib/premium/guide-sections";

// Conteúdo travado depende da sessão do usuário — nunca pode ser cacheado/estático.
export const dynamic = "force-dynamic";

// 403 sem nenhum byte do conteúdo travado (fail-closed).
function forbidden() {
  return NextResponse.json(
    { error: "Conteúdo disponível apenas no acesso premium." },
    { status: 403, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Supabase não configurado => ninguém é premium (fail-closed).
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return forbidden();
  }

  // Autentica pelo cookie de sessão. getUser() revalida o JWT no servidor de
  // auth do Supabase (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return forbidden();

  // Lê o próprio entitlement sob RLS (policy "Users can view own entitlement").
  // Service role não é necessário: o usuário pode ler a própria linha.
  const { data, error } = await supabase
    .from("user_entitlements")
    .select("is_premium, premium_until")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return forbidden();
  if (!isPremiumActive((data as PremiumEntitlement | null) ?? null)) {
    return forbidden();
  }

  // Premium ativo: só agora o conteúdo travado é materializado.
  const sections = getPremiumGuideSections(slug);
  if (!sections) {
    return NextResponse.json(
      { error: "Guia não encontrado." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return NextResponse.json(sections, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
