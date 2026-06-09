import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '@/types/tax-profile';
import { encodeSharedPayload, decodeSharedPayload } from './share-link';
import { calculateChecklistProgress } from '@/lib/rules/tax-rules';

describe('encodeSharedPayload / decodeSharedPayload', () => {
  it('round-trip preserva perfil e checklist completos', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    profile.assets.hasProperty = true;
    profile.taxYear = 2025;
    const checklistState = { cl_clt_report: true, cl_bank_reports: false };
    const encoded = encodeSharedPayload(profile, checklistState);
    const decoded = decodeSharedPayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.profile).toEqual(profile);
    expect(decoded!.checklistState).toEqual(checklistState);
  });

  it('perfil vazio e checklist vazio sobrevivem ao round-trip', () => {
    const profile = createEmptyProfile();
    const encoded = encodeSharedPayload(profile, {});
    const decoded = decodeSharedPayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.profile).toEqual(profile);
    expect(decoded!.checklistState).toEqual({});
  });

  it('link antigo (apenas TaxProfile, sem wrapper) é retrocompatível', () => {
    // Simulates old links that encoded raw TaxProfile without { profile, checklist }
    const oldProfile = { id: 'old-id', taxYear: 2024, income: { hasCltIncome: true } };
    const oldEncoded = btoa(encodeURIComponent(JSON.stringify(oldProfile)));
    const decoded = decodeSharedPayload(oldEncoded);
    expect(decoded).not.toBeNull();
    expect((decoded!.profile as Record<string, unknown>)['taxYear']).toBe(2024);
    expect(decoded!.checklistState).toEqual({}); // no checklist in old links
  });

  it('string aleatória retorna null (link inválido)', () => {
    expect(decodeSharedPayload('nao-e-base64-valido!')).toBeNull();
  });

  it('base64 válido mas JSON inválido retorna null', () => {
    const badJson = btoa(encodeURIComponent('{json inválido'));
    expect(decodeSharedPayload(badJson)).toBeNull();
  });

  it('string vazia retorna null', () => {
    expect(decodeSharedPayload('')).toBeNull();
  });

  it('payload com profile ausente (array) retorna null', () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify([])));
    expect(decodeSharedPayload(encoded)).toBeNull();
  });
});

describe('calculateChecklistProgress — consistência com itens concluídos', () => {
  it('lista vazia retorna 0', () => {
    expect(calculateChecklistProgress([])).toBe(0);
  });

  it('todos required concluídos retorna 100', () => {
    const items = [
      { id: 'a', required: true, completed: true },
      { id: 'b', required: true, completed: true },
    ];
    expect(calculateChecklistProgress(items as never)).toBe(100);
  });

  it('metade required concluídos retorna 50', () => {
    const items = [
      { id: 'a', required: true, completed: true },
      { id: 'b', required: true, completed: false },
      { id: 'c', required: false, completed: false },
    ];
    expect(calculateChecklistProgress(items as never)).toBe(50);
  });

  it('itens não-required ignorados no cálculo de progresso', () => {
    const items = [
      { id: 'a', required: false, completed: false },
      { id: 'b', required: false, completed: true },
    ];
    expect(calculateChecklistProgress(items as never)).toBe(0);
  });
});
