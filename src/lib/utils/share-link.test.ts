import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '@/types/tax-profile';
import { encodeSharedProfile, decodeSharedProfile } from './share-link';
import { calculateChecklistProgress } from '@/lib/rules/tax-rules';

describe('encodeSharedProfile / decodeSharedProfile', () => {
  it('round-trip preserva perfil completo', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    profile.assets.hasProperty = true;
    profile.taxYear = 2025;
    const encoded = encodeSharedProfile(profile);
    const decoded = decodeSharedProfile(encoded);
    expect(decoded).toEqual(profile);
  });

  it('perfil vazio sobrevive ao round-trip', () => {
    const profile = createEmptyProfile();
    const encoded = encodeSharedProfile(profile);
    expect(decodeSharedProfile(encoded)).toEqual(profile);
  });

  it('string aleatória retorna null (link inválido)', () => {
    expect(decodeSharedProfile('nao-e-base64-valido!')).toBeNull();
  });

  it('base64 válido mas JSON inválido retorna null', () => {
    const badJson = btoa(encodeURIComponent('{json inválido'));
    expect(decodeSharedProfile(badJson)).toBeNull();
  });

  it('string vazia retorna null', () => {
    expect(decodeSharedProfile('')).toBeNull();
  });

  it('link antigo sem campos novos ainda decodifica sem lançar erro', () => {
    const oldProfile = { id: 'old', taxYear: 2024, income: { hasCltIncome: true } };
    const encoded = btoa(encodeURIComponent(JSON.stringify(oldProfile)));
    const decoded = decodeSharedProfile(encoded);
    expect(decoded).not.toBeNull();
    expect((decoded as Record<string, unknown>)['taxYear']).toBe(2024);
  });
});

describe('calculateChecklistProgress — consistência com itens concluídos', () => {
  // Verifica que o cálculo de progresso é consistente com os flags completed
  // Regressão da auditoria de divergência checklist/relatório (BUG 3)
  it('items sem nenhum required retorna 0', () => {
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

  it('itens não-required são ignorados no cálculo de progresso', () => {
    const items = [
      { id: 'a', required: false, completed: false },
      { id: 'b', required: false, completed: true },
    ];
    expect(calculateChecklistProgress(items as never)).toBe(0);
  });
});
