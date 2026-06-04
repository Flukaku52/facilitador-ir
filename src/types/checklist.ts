export type ChecklistCategory =
  | 'income'
  | 'bank'
  | 'assets'
  | 'investments'
  | 'deductions'
  | 'complex_cases'
  | 'other';

export const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  income: 'Renda',
  bank: 'Bancos',
  assets: 'Bens',
  investments: 'Investimentos',
  deductions: 'Despesas e Deduções',
  complex_cases: 'Casos que exigem atenção',
  other: 'Outros',
};

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: ChecklistCategory;
  required: boolean;
  completed: boolean;
  relatedGuideSlug?: string;
}
