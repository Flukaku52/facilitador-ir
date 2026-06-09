import { TaxProfile } from '@/types/tax-profile';

export function encodeSharedProfile(profile: TaxProfile): string {
  return btoa(encodeURIComponent(JSON.stringify(profile)));
}

export function decodeSharedProfile(encoded: string): TaxProfile | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as TaxProfile;
  } catch {
    return null;
  }
}
