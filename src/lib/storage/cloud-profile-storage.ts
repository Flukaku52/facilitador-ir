import { TaxProfile } from '@/types/tax-profile';
import { createClient } from '@/lib/supabase/client';
import { getCurrentTaxYear } from '@/lib/tax-years';

// Pure function — testable without mocks
export type MigrationDecision = 'none' | 'load-cloud' | 'prompt';

export function decideMigration(
  localProfile: TaxProfile | null,
  cloudProfile: TaxProfile | null,
): MigrationDecision {
  if (!localProfile && !cloudProfile) return 'none';
  if (!localProfile && cloudProfile) return 'load-cloud';
  // localProfile exists (cloud may or may not): ask the user
  return 'prompt';
}

// taxYear = ano-base (profile.taxYear). Default: ano-base corrente.
export async function loadCloudProfile(
  userId: string,
  taxYear: number = getCurrentTaxYear(),
): Promise<TaxProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('tax_profiles')
    .select('profile')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)
    .maybeSingle();
  return (data as { profile: TaxProfile } | null)?.profile ?? null;
}

// Usa profile.taxYear — nunca um valor fixo.
export async function saveCloudProfile(userId: string, profile: TaxProfile): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('tax_profiles').upsert({
    user_id: userId,
    tax_year: profile.taxYear,
    profile,
  });
  return !error;
}

// taxYear = ano-base (profile.taxYear). Default: ano-base corrente.
export async function loadCloudChecklist(
  userId: string,
  taxYear: number = getCurrentTaxYear(),
): Promise<Record<string, boolean>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('tax_profiles')
    .select('checklist_state')
    .eq('user_id', userId)
    .eq('tax_year', taxYear)
    .maybeSingle();
  return (data as { checklist_state: Record<string, boolean> } | null)?.checklist_state ?? {};
}

// Uses update (not upsert) — the profile row must exist first.
// Returns true on success or if no row exists (no-op is not an error).
// taxYear = ano-base (profile.taxYear). Default: ano-base corrente.
export async function saveCloudChecklist(
  userId: string,
  state: Record<string, boolean>,
  taxYear: number = getCurrentTaxYear(),
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('tax_profiles')
    .update({ checklist_state: state })
    .eq('user_id', userId)
    .eq('tax_year', taxYear);
  return !error;
}
