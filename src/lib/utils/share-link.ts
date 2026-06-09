import { TaxProfile } from '@/types/tax-profile';

type SharedPayload = {
  profile: TaxProfile;
  checklist?: Record<string, boolean>;
};

export function encodeSharedPayload(
  profile: TaxProfile,
  checklistState: Record<string, boolean>,
): string {
  const payload: SharedPayload = { profile, checklist: checklistState };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeSharedPayload(encoded: string): {
  profile: TaxProfile;
  checklistState: Record<string, boolean>;
} | null {
  try {
    const raw: unknown = JSON.parse(decodeURIComponent(atob(encoded)));
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null;
    const obj = raw as Record<string, unknown>;

    // New format: { profile, checklist? }
    if ('profile' in obj && typeof obj.profile === 'object' && obj.profile !== null) {
      const checklistState =
        typeof obj.checklist === 'object' &&
        obj.checklist !== null &&
        !Array.isArray(obj.checklist)
          ? (obj.checklist as Record<string, boolean>)
          : {};
      return { profile: obj.profile as TaxProfile, checklistState };
    }

    // Old format: raw TaxProfile object (no `profile` key) — backward compatible
    return { profile: raw as TaxProfile, checklistState: {} };
  } catch {
    return null;
  }
}
