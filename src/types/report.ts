import { TaxProfile, ComplexityLevel } from './tax-profile';
import { ChecklistItem } from './checklist';
import { Guide } from './guide';
import { TaxAlert } from './alert';

export interface TaxReport {
  profile: TaxProfile;
  complexity: ComplexityLevel;
  checklist: ChecklistItem[];
  guides: Guide[];
  alerts: TaxAlert[];
  pendingItems: ChecklistItem[];
  generatedAt: string;
}
