import { TaxProfile } from '@/types/tax-profile';

export type TaxProfileRow = {
  id: string;
  user_id: string;
  tax_year: number;
  profile: TaxProfile;
  checklist_state: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};
