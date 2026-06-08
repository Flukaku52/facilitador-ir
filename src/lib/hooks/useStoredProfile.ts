import { useState, useEffect, useSyncExternalStore } from 'react';
import { TaxProfile } from '@/types/tax-profile';

const PROFILE_KEY = 'ir_facilitador_profile';

// Cache the parsed object so getSnapshot returns a stable reference
// when the underlying raw string hasn't changed. React 18 requires
// getSnapshot to be referentially stable between consecutive calls.
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedValue: TaxProfile | null = null;
let corruptionDetected = false;

function getSnapshot(): TaxProfile | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PROFILE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    if (!raw) { cachedValue = null; return null; }
    const parsed: unknown = JSON.parse(raw);
    cachedValue = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed))
      ? (parsed as TaxProfile)
      : null;
    return cachedValue;
  } catch {
    corruptionDetected = true;
    cachedRaw = raw; // stable ref — prevents re-parsing the same corrupt string on repeat calls
    cachedValue = null;
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

export function useProfileCorrupted(): boolean {
  // Lazy initializer reads the flag synchronously during render,
  // after the parent's useStoredProfile() has already run getSnapshot().
  const [visible, setVisible] = useState(() =>
    typeof window !== 'undefined' && corruptionDetected,
  );
  useEffect(() => {
    if (!corruptionDetected) return;
    corruptionDetected = false;
    localStorage.removeItem(PROFILE_KEY);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);
  return visible;
}
