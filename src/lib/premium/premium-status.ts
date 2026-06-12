// Regras puras do gating premium — sem side effects, sem imports de UI.

// Linha da tabela user_entitlements como vem do Postgres (snake_case).
export interface PremiumEntitlement {
  is_premium: boolean;
  // 'YYYY-MM-DD' ou null. NULL = sem expiração (ativo enquanto is_premium).
  premium_until: string | null;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Fail-closed: sem entitlement, flag desligada ou data inválida = não-premium.
// premium_until é inclusivo: ativo até o fim do dia da data (comparação por dia).
export function isPremiumActive(
  entitlement: PremiumEntitlement | null | undefined,
  today: Date = new Date(),
): boolean {
  if (!entitlement?.is_premium) return false;
  if (
    entitlement.premium_until === null ||
    entitlement.premium_until === undefined
  ) {
    return true;
  }
  if (!ISO_DATE_RE.test(entitlement.premium_until)) return false;
  return entitlement.premium_until >= toLocalDateString(today);
}

// Seções de conteúdo de um guia, por chave do tipo Guide.
export const FREE_GUIDE_SECTIONS = [
  "plainLanguageExplanation",
  "whenToCallAccountant",
] as const;

export const LOCKED_GUIDE_SECTIONS = [
  "documentsNeeded",
  "whereToDeclare",
  "howToFill",
  "commonMistakes",
] as const;

export type GuideSectionKey =
  | (typeof FREE_GUIDE_SECTIONS)[number]
  | (typeof LOCKED_GUIDE_SECTIONS)[number];

export function isGuideSectionVisible(
  section: GuideSectionKey,
  premiumActive: boolean,
): boolean {
  if (premiumActive) return true;
  return (FREE_GUIDE_SECTIONS as readonly string[]).includes(section);
}
