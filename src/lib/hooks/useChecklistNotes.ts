import { useSyncExternalStore } from 'react';
import { NOTES_KEY, loadChecklistNotes } from '@/lib/storage/local-profile-storage';

const EMPTY_NOTES: Record<string, string> = {};

let cachedRaw: string | null = undefined as unknown as string | null;
let cachedValue: Record<string, string> = EMPTY_NOTES;

function getSnapshot(): Record<string, string> {
  if (typeof window === 'undefined') return EMPTY_NOTES;
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? loadChecklistNotes() : EMPTY_NOTES;
    return cachedValue;
  } catch {
    return EMPTY_NOTES;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

export function useChecklistNotes(): Record<string, string> {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_NOTES);
}
