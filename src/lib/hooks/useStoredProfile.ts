import { useSyncExternalStore } from 'react';
import { TaxProfile } from '@/types/tax-profile';

const PROFILE_KEY = 'ir_facilitador_profile';

function getSnapshot(): TaxProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as TaxProfile) : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function useStoredProfile(): TaxProfile | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
