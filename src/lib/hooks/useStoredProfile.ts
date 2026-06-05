import { useSyncExternalStore } from 'react';
import { TaxProfile } from '@/types/tax-profile';

const PROFILE_KEY = 'ir_facilitador_profile';

// Cache the parsed object so getSnapshot returns a stable reference
// when the underlying raw string hasn't changed. React 18 requires
// getSnapshot to be referentially stable between consecutive calls.
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedValue: TaxProfile | null = null;

function getSnapshot(): TaxProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as TaxProfile) : null;
    return cachedValue;
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
