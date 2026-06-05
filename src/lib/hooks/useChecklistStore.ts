import { useSyncExternalStore } from 'react';

const CHECKLIST_KEY = 'ir_facilitador_checklist';

function getSnapshot(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
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
