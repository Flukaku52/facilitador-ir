import { createClient } from "@/lib/supabase/client";
import { PremiumEntitlement } from "./premium-status";

// Lê o entitlement do próprio usuário (RLS permite só SELECT da própria linha).
// Fail-closed: sem linha ou erro de rede/permissão => null (tratado como não-premium).
export async function loadEntitlement(
  userId: string,
): Promise<PremiumEntitlement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_entitlements")
    .select("is_premium, premium_until")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return (data as PremiumEntitlement | null) ?? null;
}
