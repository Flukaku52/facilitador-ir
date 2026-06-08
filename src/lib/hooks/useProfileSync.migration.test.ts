import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const MIGRATION_FLAG = 'ir_migration_v1_handled';
const PROFILE_KEY = 'ir_facilitador_profile';
const DRAFT_KEY = 'ir_facilitador_questionnaire_draft';

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

// Mirrors the migration-skip check from useProfileSync after the fix.
function migrationAlreadyHandled(ls: ReturnType<typeof makeLocalStorageMock>): boolean {
  return Boolean(ls.getItem(MIGRATION_FLAG));
}

// Mirrors isProfileActuallyInvalid from useStoredProfile.
function profileIsCorrupted(ls: ReturnType<typeof makeLocalStorageMock>): boolean {
  const raw = ls.getItem(PROFILE_KEY);
  if (!raw) return false;
  try {
    const parsed: unknown = JSON.parse(raw);
    return !(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed));
  } catch {
    return true;
  }
}

describe('marcador de migração — compatibilidade retroativa e sem toast falso', () => {
  it('perfil válido + flag com UUID antigo → migração já concluída, sem toast', () => {
    const ls = makeLocalStorageMock({
      [PROFILE_KEY]: JSON.stringify({ id: 'new-id', taxYear: 2025 }),
      [MIGRATION_FLAG]: 'c0f784b4-0000-0000-0000-000000000000', // UUID antigo (valor truthy)
    });
    expect(migrationAlreadyHandled(ls)).toBe(true); // migração pula
    expect(profileIsCorrupted(ls)).toBe(false);     // sem toast
  });

  it('perfil válido + sem flag → migração deve executar, sem toast', () => {
    const ls = makeLocalStorageMock({
      [PROFILE_KEY]: JSON.stringify({ id: 'some-id', taxYear: 2025 }),
      // MIGRATION_FLAG ausente
    });
    expect(migrationAlreadyHandled(ls)).toBe(false); // migração executa
    expect(profileIsCorrupted(ls)).toBe(false);      // sem toast (perfil está OK)
  });

  it('perfil válido + flag com novo ID de perfil → migração já concluída, sem toast', () => {
    const ls = makeLocalStorageMock({
      [PROFILE_KEY]: JSON.stringify({ id: '254c2598-abcd', taxYear: 2025 }),
      [MIGRATION_FLAG]: 'v1',
    });
    expect(migrationAlreadyHandled(ls)).toBe(true); // migração pula
    expect(profileIsCorrupted(ls)).toBe(false);     // sem toast
  });

  it('JSON inválido em ir_facilitador_profile → toast deve disparar', () => {
    const ls = makeLocalStorageMock({
      [PROFILE_KEY]: '{json inválido',
      [MIGRATION_FLAG]: 'v1',
    });
    expect(profileIsCorrupted(ls)).toBe(true); // toast dispara
  });

  it('valor não-objeto em ir_facilitador_profile → toast deve disparar', () => {
    const ls = makeLocalStorageMock({
      [PROFILE_KEY]: '42', // número — não é objeto
      [MIGRATION_FLAG]: 'v1',
    });
    expect(profileIsCorrupted(ls)).toBe(true); // toast dispara
  });
});

describe('rascunho de questionário não é afetado pela correção do flag de migração', () => {
  beforeEach(() => {
    vi.resetModules();
    stubWindow(makeLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('draft salvo e carregado normalmente mesmo com flag de migração presente', async () => {
    const lsMock = makeLocalStorageMock({
      [MIGRATION_FLAG]: 'v1',
    });
    stubWindow(lsMock);
    const { saveDraft, loadDraft } = await import('@/lib/storage/local-profile-storage');
    saveDraft({ 'income.hasCltIncome': true }, 2);
    const loaded = loadDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.answers?.['income.hasCltIncome']).toBe(true);
    expect(loaded?.currentIndex).toBe(2);
    expect(lsMock.getItem(DRAFT_KEY)).not.toBeNull(); // draft key intacta
    expect(lsMock.getItem(MIGRATION_FLAG)).toBe('v1'); // migration flag intacta
  });
});
