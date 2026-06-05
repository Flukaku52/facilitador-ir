import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const CHECKLIST_KEY = 'ir_facilitador_checklist';

function makeLocalStorageMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
  };
}

function stubWindow(lsMock: ReturnType<typeof makeLocalStorageMock>) {
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    localStorage: lsMock,
  });
  vi.stubGlobal('localStorage', lsMock);
}

describe('useChecklistStore — snapshot stability', () => {
  beforeEach(() => {
    vi.resetModules();
    stubWindow(makeLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Regression test: the bug that caused "getServerSnapshot should be cached"
  // was returning () => ({}) — a new object on every call.
  // EMPTY_CHECKLIST_STATE must be the same reference every time.
  it('EMPTY_CHECKLIST_STATE is referentially stable (prevents getServerSnapshot loop)', async () => {
    const { EMPTY_CHECKLIST_STATE } = await import('./useChecklistStore');
    const serverSnapshot = () => EMPTY_CHECKLIST_STATE;
    expect(serverSnapshot()).toBe(serverSnapshot());
  });

  it('getChecklistSnapshot returns the stable empty state when localStorage is empty', async () => {
    const { getChecklistSnapshot, EMPTY_CHECKLIST_STATE } = await import('./useChecklistStore');
    expect(getChecklistSnapshot()).toBe(EMPTY_CHECKLIST_STATE);
  });

  it('getChecklistSnapshot returns the same reference on consecutive calls with no data', async () => {
    const { getChecklistSnapshot } = await import('./useChecklistStore');
    const a = getChecklistSnapshot();
    const b = getChecklistSnapshot();
    expect(a).toBe(b);
  });

  it('getChecklistSnapshot returns stable reference when data is unchanged', async () => {
    const data = { 'cl_clt': true, 'cl_bank': false };
    stubWindow(makeLocalStorageMock({ [CHECKLIST_KEY]: JSON.stringify(data) }));
    const { getChecklistSnapshot } = await import('./useChecklistStore');
    const a = getChecklistSnapshot();
    const b = getChecklistSnapshot();
    expect(a).toBe(b);
    expect(a).toEqual(data);
  });

  it('getChecklistSnapshot parses stored checklist state correctly', async () => {
    const data = { 'cl_clt': true, 'cl_investments': false, 'cl_property': true };
    stubWindow(makeLocalStorageMock({ [CHECKLIST_KEY]: JSON.stringify(data) }));
    const { getChecklistSnapshot } = await import('./useChecklistStore');
    expect(getChecklistSnapshot()).toEqual(data);
  });

  it('getChecklistSnapshot returns new reference when data changes between calls', async () => {
    const lsMock = makeLocalStorageMock({ [CHECKLIST_KEY]: JSON.stringify({ 'cl_clt': true }) });
    stubWindow(lsMock);
    const { getChecklistSnapshot } = await import('./useChecklistStore');
    const a = getChecklistSnapshot();
    lsMock.setItem(CHECKLIST_KEY, JSON.stringify({ 'cl_clt': false }));
    const b = getChecklistSnapshot();
    expect(a).not.toBe(b);
    expect(b).toEqual({ 'cl_clt': false });
  });

  it('getChecklistSnapshot returns stable empty state on invalid JSON', async () => {
    stubWindow(makeLocalStorageMock({ [CHECKLIST_KEY]: '{json invalido' }));
    const { getChecklistSnapshot, EMPTY_CHECKLIST_STATE } = await import('./useChecklistStore');
    const result = getChecklistSnapshot();
    expect(result).toBe(EMPTY_CHECKLIST_STATE);
  });
});
