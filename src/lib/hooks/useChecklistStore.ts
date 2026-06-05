import { useSyncExternalStore } from 'react';

const CHECKLIST_KEY = 'ir_facilitador_checklist';

// Cache the parsed object so getSnapshot returns a stable reference
// when the underlying raw string hasn't changed. React 18 requires
// getSnapshot to be referentially stable between consecutive calls.
let cachedRaw: string | null = undefined as unknown as string | null;
let cachedValue: Record<string, boolean> = {};

function getSnapshot(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    return cachedValue;
  } catch {
    return {};
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function useChecklistStore(): Record<string, boolean> {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({}));
}
