import { useSyncExternalStore } from 'react';

const CHECKLIST_KEY = 'ir_facilitador_checklist';

// Stable empty object — returned as the server snapshot and when localStorage has no data.
// Must be module-level so getServerSnapshot always returns the same reference;
// a new {} on every call triggers the "getServerSnapshot should be cached" error.
export const EMPTY_CHECKLIST_STATE: Record<string, boolean> = {};

// Cache the parsed object so getSnapshot returns a stable reference
// when the underlying raw string hasn't changed. React 18 requires
// getSnapshot to be referentially stable between consecutive calls.
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedValue: Record<string, boolean> = EMPTY_CHECKLIST_STATE;

export function getChecklistSnapshot(): Record<string, boolean> {
  if (typeof window === 'undefined') return EMPTY_CHECKLIST_STATE;
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as Record<string, boolean>) : EMPTY_CHECKLIST_STATE;
    return cachedValue;
  } catch {
    return EMPTY_CHECKLIST_STATE;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function useChecklistStore(): Record<string, boolean> {
  return useSyncExternalStore(subscribe, getChecklistSnapshot, () => EMPTY_CHECKLIST_STATE);
}
