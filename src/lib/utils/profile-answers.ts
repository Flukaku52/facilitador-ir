import { QUESTIONS } from '@/lib/data/questions';
import { TaxProfile, createEmptyProfile } from '@/types/tax-profile';
import { QuestionAnswers } from '@/types/question';
import { classifyComplexity } from '@/lib/rules/tax-rules';

export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function setNestedValue(obj: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj as Record<string, unknown>;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

export function profileToAnswers(profile: TaxProfile): QuestionAnswers {
  const answers: QuestionAnswers = {};
  for (const q of QUESTIONS) {
    const value = getNestedValue(profile, q.fieldPath);
    if (typeof value === 'boolean') answers[q.fieldPath] = value;
  }
  return answers;
}

export function answersToProfile(answers: QuestionAnswers): TaxProfile {
  const profile = createEmptyProfile();
  for (const [path, value] of Object.entries(answers)) {
    setNestedValue(profile, path, value);
  }
  profile.complexity = classifyComplexity(profile, profile.taxYear);
  profile.updatedAt = new Date().toISOString();
  return profile;
}
