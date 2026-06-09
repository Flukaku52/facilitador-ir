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

// Tests for the corruption-detection guard logic (mirrors isProfileActuallyInvalid in useStoredProfile)
describe('detecção de perfil corrompido — lógica de guarda', () => {
  function isInvalid(raw: string | null): boolean {
    if (raw === null) return false; // no data — not corruption
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) return false;
      return true;
    } catch {
      return true;
    }
  }

  it('perfil válido não dispara flag de corrompido', () => {
    const profile = JSON.stringify({ id: 'x', taxYear: 2025, income: { hasCltIncome: true } });
    expect(isInvalid(profile)).toBe(false);
  });

  it('objeto vazio não dispara flag de corrompido', () => {
    expect(isInvalid('{}')).toBe(false);
  });

  it('ausência de chave (null) não dispara flag', () => {
    expect(isInvalid(null)).toBe(false);
  });

  it('JSON inválido dispara flag', () => {
    expect(isInvalid('{json inválido')).toBe(true);
  });

  it('null literal dispara flag', () => {
    expect(isInvalid('null')).toBe(true);
  });

  it('array dispara flag', () => {
    expect(isInvalid('[]')).toBe(true);
  });

  it('primitivo (número) dispara flag', () => {
    expect(isInvalid('42')).toBe(true);
  });

  it('perfil antigo parcial (sem campo novo) não dispara flag', () => {
    const old = JSON.stringify({ id: 'old', taxYear: 2024, income: { hasCltIncome: true } });
    expect(isInvalid(old)).toBe(false);
  });

  it('flag de migração já concluída não interfere (ausência de perfil não é corrompimento)', () => {
    expect(isInvalid(null)).toBe(false);
  });
});

describe('saveDraft / loadDraft / clearDraft', () => {
  const DRAFT_KEY = 'ir_facilitador_questionnaire_draft';

  beforeEach(() => {
    vi.resetModules();
    stubWindow(makeLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('salva e recarrega rascunho válido', async () => {
    const { saveDraft, loadDraft } = await import('./local-profile-storage');
    const answers = { 'income.hasCltIncome': true, 'assets.hasBankAccounts': false };
    saveDraft(answers, 3);
    const loaded = loadDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.answers).toEqual(answers);
    expect(loaded?.currentIndex).toBe(3);
  });

  it('loadDraft retorna null quando não há rascunho', async () => {
    const { loadDraft } = await import('./local-profile-storage');
    expect(loadDraft()).toBeNull();
  });

  it('clearDraft remove o rascunho', async () => {
    const { saveDraft, loadDraft, clearDraft } = await import('./local-profile-storage');
    saveDraft({ 'income.hasCltIncome': true }, 1);
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('rascunho com JSON inválido não quebra — retorna null', async () => {
    stubWindow(makeLocalStorageMock({ [DRAFT_KEY]: '{json inválido' }));
    const { loadDraft } = await import('./local-profile-storage');
    expect(loadDraft()).toBeNull();
  });

  it('rascunho sem currentIndex retorna null', async () => {
    stubWindow(makeLocalStorageMock({ [DRAFT_KEY]: JSON.stringify({ answers: {} }) }));
    const { loadDraft } = await import('./local-profile-storage');
    expect(loadDraft()).toBeNull();
  });

  it('rascunho com currentIndex negativo é corrigido para 0', async () => {
    stubWindow(makeLocalStorageMock({ [DRAFT_KEY]: JSON.stringify({ answers: {}, currentIndex: -5, updatedAt: '' }) }));
    const { loadDraft } = await import('./local-profile-storage');
    const loaded = loadDraft();
    expect(loaded?.currentIndex).toBe(0);
  });

  it('rascunho com answers inválido usa objeto vazio', async () => {
    stubWindow(makeLocalStorageMock({ [DRAFT_KEY]: JSON.stringify({ answers: 'inválido', currentIndex: 2, updatedAt: '' }) }));
    const { loadDraft } = await import('./local-profile-storage');
    const loaded = loadDraft();
    expect(loaded).not.toBeNull();
    expect(loaded?.answers).toEqual({});
    expect(loaded?.currentIndex).toBe(2);
  });
});

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

describe('loadChecklistNotes / saveChecklistNote', () => {
  const NOTES_KEY = 'ir_facilitador_checklist_notes';

  beforeEach(() => {
    vi.resetModules();
    stubWindow(makeLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna {} quando não há notas salvas', async () => {
    const { loadChecklistNotes } = await import('./local-profile-storage');
    expect(loadChecklistNotes()).toEqual({});
  });

  it('salva e carrega nota para um item', async () => {
    const { saveChecklistNote, loadChecklistNotes } = await import('./local-profile-storage');
    saveChecklistNote('cl_clt_report', 'Peguei no RH');
    const notes = loadChecklistNotes();
    expect(notes['cl_clt_report']).toBe('Peguei no RH');
  });

  it('nota vazia remove a chave', async () => {
    const mock = makeLocalStorageMock({ [NOTES_KEY]: JSON.stringify({ cl_clt_report: 'existente' }) });
    stubWindow(mock);
    const { saveChecklistNote, loadChecklistNotes } = await import('./local-profile-storage');
    saveChecklistNote('cl_clt_report', '');
    expect(loadChecklistNotes()['cl_clt_report']).toBeUndefined();
  });

  it('nota com apenas espaços é tratada como vazia', async () => {
    const { saveChecklistNote, loadChecklistNotes } = await import('./local-profile-storage');
    saveChecklistNote('cl_bank_reports', '   ');
    expect(loadChecklistNotes()['cl_bank_reports']).toBeUndefined();
  });

  it('múltiplas notas coexistem sem se sobrescrever', async () => {
    const { saveChecklistNote, loadChecklistNotes } = await import('./local-profile-storage');
    saveChecklistNote('item_a', 'Nota A');
    saveChecklistNote('item_b', 'Nota B');
    const notes = loadChecklistNotes();
    expect(notes['item_a']).toBe('Nota A');
    expect(notes['item_b']).toBe('Nota B');
  });

  it('JSON inválido em notes retorna {} sem quebrar', async () => {
    stubWindow(makeLocalStorageMock({ [NOTES_KEY]: '{inválido' }));
    const { loadChecklistNotes } = await import('./local-profile-storage');
    expect(loadChecklistNotes()).toEqual({});
  });
});
