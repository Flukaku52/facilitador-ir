import { ChecklistCategory } from './checklist';

export interface Guide {
  slug: string;
  title: string;
  shortDescription: string;
  category: ChecklistCategory;
  appliesTo: string[];
  plainLanguageExplanation: string;
  documentsNeeded: string[];
  whereToDeclare: string;
  howToFill: string[];
  commonMistakes: string[];
  whenToCallAccountant?: string[];
  isAlert?: boolean;
}
