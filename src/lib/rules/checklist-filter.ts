import { ChecklistItem, ChecklistCategory } from '@/types/checklist';

export type StatusFilter = 'all' | 'pending' | 'done';

export interface ChecklistFilters {
  status: StatusFilter;
  category: ChecklistCategory | 'all';
  query: string;
}

export const CHECKLIST_CATEGORY_ORDER: ChecklistCategory[] = [
  'income',
  'bank',
  'assets',
  'investments',
  'deductions',
  'complex_cases',
  'other',
];

// Strip diacritics and lowercase for accent-insensitive + case-insensitive matching.
// "médicas" → "medicas", "educação" → "educacao"
function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function applyChecklistFilters(
  items: ChecklistItem[],
  filters: ChecklistFilters,
): ChecklistItem[] {
  let result = items;

  if (filters.status === 'pending') result = result.filter((i) => !i.completed);
  if (filters.status === 'done') result = result.filter((i) => i.completed);

  if (filters.category !== 'all') {
    result = result.filter((i) => i.category === filters.category);
  }

  const q = normalize(filters.query.trim());
  if (q) {
    result = result.filter(
      (i) =>
        normalize(i.title).includes(q) ||
        normalize(i.description ?? '').includes(q),
    );
  }

  return result;
}

// Returns the categories present in `items`, in CHECKLIST_CATEGORY_ORDER order.
// Categories without any item are excluded.
export function getAvailableCategories(items: ChecklistItem[]): ChecklistCategory[] {
  const seen = new Set<ChecklistCategory>(items.map((i) => i.category));
  return CHECKLIST_CATEGORY_ORDER.filter((c) => seen.has(c));
}
