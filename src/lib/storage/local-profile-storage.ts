import { TaxProfile } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';

const PROFILE_KEY = 'ir_facilitador_profile';
const CHECKLIST_KEY = 'ir_facilitador_checklist';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function notify(key: string) {
  if (!isBrowser()) return;
  window.dispatchEvent(new StorageEvent('storage', { key }));
}

export function saveTaxProfile(profile: TaxProfile): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    notify(PROFILE_KEY);
  } catch {}
}

export function loadTaxProfile(): TaxProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    return parsed as TaxProfile;
  } catch {
    return null;
  }
}

export function clearTaxProfile(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PROFILE_KEY);
  notify(PROFILE_KEY);
}

export function saveChecklistState(items: ChecklistItem[]): void {
  if (!isBrowser()) return;
  try {
    const state: Record<string, boolean> = {};
    for (const item of items) state[item.id] = item.completed;
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
    notify(CHECKLIST_KEY);
  } catch {}
}

export function saveChecklistStateMap(state: Record<string, boolean>): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
    notify(CHECKLIST_KEY);
  } catch {}
}

export function loadChecklistState(): Record<string, boolean> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function clearChecklistState(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(CHECKLIST_KEY);
  notify(CHECKLIST_KEY);
}

export function clearAll(): void {
  clearTaxProfile();
  clearChecklistState();
}
