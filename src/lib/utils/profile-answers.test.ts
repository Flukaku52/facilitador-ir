import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '@/types/tax-profile';
import { profileToAnswers, answersToProfile } from './profile-answers';

// ─── profileToAnswers ─────────────────────────────────────────────────────────

describe('profileToAnswers', () => {
  it('inclui deductions.hasInformalEducation=true quando profile tem true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasInformalEducation = true;
    const answers = profileToAnswers(profile);
    expect(answers['deductions.hasInformalEducation']).toBe(true);
  });

  it('inclui deductions.hasInformalEducation=false quando profile tem false', () => {
    const profile = createEmptyProfile();
    // false é o default de createEmptyProfile; confirma que o campo é emitido
    const answers = profileToAnswers(profile);
    expect(answers['deductions.hasInformalEducation']).toBe(false);
  });

  it('inclui deductions.hasEducationExpenses junto com hasInformalEducation', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    profile.deductions.hasInformalEducation = true;
    const answers = profileToAnswers(profile);
    expect(answers['deductions.hasEducationExpenses']).toBe(true);
    expect(answers['deductions.hasInformalEducation']).toBe(true);
  });
});

// ─── answersToProfile ─────────────────────────────────────────────────────────

describe('answersToProfile', () => {
  it('gera profile.deductions.hasInformalEducation=true a partir de answers', () => {
    const profile = answersToProfile({ 'deductions.hasInformalEducation': true });
    expect(profile.deductions.hasInformalEducation).toBe(true);
  });

  it('gera profile.deductions.hasInformalEducation=false quando answer é false', () => {
    const profile = answersToProfile({ 'deductions.hasInformalEducation': false });
    expect(profile.deductions.hasInformalEducation).toBe(false);
  });

  it('sem entrada para hasInformalEducation, profile usa default false de createEmptyProfile', () => {
    const profile = answersToProfile({});
    expect(profile.deductions.hasInformalEducation).toBe(false);
  });

  it('preserva hasEducationExpenses e hasInformalEducation simultaneamente', () => {
    const profile = answersToProfile({
      'deductions.hasEducationExpenses': true,
      'deductions.hasInformalEducation': true,
    });
    expect(profile.deductions.hasEducationExpenses).toBe(true);
    expect(profile.deductions.hasInformalEducation).toBe(true);
  });
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('profileToAnswers → answersToProfile round-trip', () => {
  it('hasInformalEducation=true sobrevive ao ciclo profile→answers→profile', () => {
    const original = createEmptyProfile();
    original.deductions.hasEducationExpenses = true;
    original.deductions.hasInformalEducation = true;

    const answers = profileToAnswers(original);
    const restored = answersToProfile(answers);

    expect(restored.deductions.hasEducationExpenses).toBe(true);
    expect(restored.deductions.hasInformalEducation).toBe(true);
  });

  it('hasInformalEducation=false sobrevive ao ciclo profile→answers→profile', () => {
    const original = createEmptyProfile();
    original.deductions.hasEducationExpenses = true;
    original.deductions.hasInformalEducation = false;

    const answers = profileToAnswers(original);
    const restored = answersToProfile(answers);

    expect(restored.deductions.hasInformalEducation).toBe(false);
  });
});
