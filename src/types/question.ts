export type QuestionType = 'boolean';

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  section: 'income' | 'assets' | 'investments' | 'deductions' | 'documents';
  sectionLabel: string;
  fieldPath: string;
  showWhen?: {
    fieldPath: string;
    equals: boolean;
  };
}

export type QuestionAnswers = Record<string, boolean>;
