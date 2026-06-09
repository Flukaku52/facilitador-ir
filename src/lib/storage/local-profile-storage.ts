import { TaxProfile } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';
import { QuestionAnswers } from '@/types/question';

const PROFILE_KEY = 'ir_facilitador_profile';
const CHECKLIST_KEY = 'ir_facilitador_checklist';
const DRAFT_KEY = 'ir_facilitador_questionnaire_draft';
export const NOTES_KEY = 'ir_facilitador_checklist_notes';

type QuestionnaireDraft = {
  answers: QuestionAnswers;
  currentIndex: number;
  updatedAt: string;
};

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

export function saveDraft(answers: QuestionAnswers, currentIndex: number): void {
  if (!isBrowser()) return;
  try {
    const draft: QuestionnaireDraft = { answers, currentIndex, updatedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {}
}

export function loadDraft(): { answers: QuestionAnswers; currentIndex: number } | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const d = parsed as Record<string, unknown>;
    if (typeof d.currentIndex !== 'number') return null;
    const answers: QuestionAnswers =
      typeof d.answers === 'object' && d.answers !== null && !Array.isArray(d.answers)
        ? (d.answers as QuestionAnswers)
        : {};
    return { answers, currentIndex: Math.max(0, d.currentIndex) };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

export function loadChecklistNotes(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveChecklistNote(id: string, note: string): void {
  if (!isBrowser()) return;
  try {
    const current = loadChecklistNotes();
    if (note.trim()) {
      current[id] = note.trim();
    } else {
      delete current[id];
    }
    localStorage.setItem(NOTES_KEY, JSON.stringify(current));
    notify(NOTES_KEY);
  } catch {}
}
