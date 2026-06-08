import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const PROFILE_KEY = 'ir_facilitador_profile';

function makeLocalStorageMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { for (const key of Object.keys(store)) delete store[key]; },
  };
}

function stubWindow(lsMock: ReturnType<typeof makeLocalStorageMock>) {
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    localStorage: lsMock,
  });
  vi.stubGlobal('localStorage', lsMock);
}

describe('loadTaxProfile — validação defensiva', () => {
  beforeEach(() => {
    vi.resetModules();
    stubWindow(makeLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna null quando localStorage está vazio', async () => {
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna null quando JSON é inválido', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: '{json inválido' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna null quando JSON é "null" (null literal)', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: 'null' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna null quando JSON é um array', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: '[]' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna null quando JSON é uma string', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: '"perfil"' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna null quando JSON é um número', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: '42' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toBeNull();
  });

  it('retorna objeto quando JSON é um objeto vazio', async () => {
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: '{}' }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toEqual({});
  });

  it('retorna perfil válido corretamente', async () => {
    const profile = { id: 'abc', taxYear: 2025, income: { hasCltIncome: true } };
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: JSON.stringify(profile) }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    expect(loadTaxProfile()).toEqual(profile);
  });

  it('perfil antigo sem campo novo (hasBusinessIncome undefined) não quebra', async () => {
    const oldProfile = {
      id: 'old',
      taxYear: 2024,
      income: { hasCltIncome: true },
    };
    stubWindow(makeLocalStorageMock({ [PROFILE_KEY]: JSON.stringify(oldProfile) }));
    const { loadTaxProfile } = await import('./local-profile-storage');
    const result = loadTaxProfile();
    expect(result).not.toBeNull();
    expect((result as Record<string, unknown>)?.['id']).toBe('old');
  });
});
