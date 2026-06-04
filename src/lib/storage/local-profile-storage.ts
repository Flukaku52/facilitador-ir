import { TaxProfile } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';

const PROFILE_KEY = 'ir_facilitador_profile';
const CHECKLIST_KEY = 'ir_facilitador_checklist';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function saveTaxProfile(profile: TaxProfile): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

export function loadTaxProfile(): TaxProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TaxProfile;
  } catch {
    return null;
  }
}

export function clearTaxProfile(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(PROFILE_KEY);
}

export function saveChecklistState(items: ChecklistItem[]): void {
  if (!isBrowser()) return;
  try {
    const state: Record<string, boolean> = {};
    for (const item of items) {
      state[item.id] = item.completed;
    }
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
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
}

export function clearAll(): void {
  clearTaxProfile();
  clearChecklistState();
}
