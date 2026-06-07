import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TaxProfile } from '@/types/tax-profile';

// ---------------------------------------------------------------------------
// Mock Supabase client
// vi.hoisted runs before vi.mock factories, making the spies accessible there.
// ---------------------------------------------------------------------------
const { mockMaybySingle, mockUpsert, mockUpdateEnd } = vi.hoisted(() => ({
  mockMaybySingle: vi.fn<[], Promise<{ data: unknown; error: unknown }>>(),
  mockUpsert: vi.fn<[], Promise<{ data: unknown; error: unknown }>>(),
  mockUpdateEnd: vi.fn<[], Promise<{ data: unknown; error: unknown }>>(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({ maybeSingle: mockMaybySingle }),
        }),
      }),
      upsert: mockUpsert,
      update: () => ({
        eq: () => ({
          eq: mockUpdateEnd,
        }),
      }),
    }),
  }),
}));

import {
  decideMigration,
  loadCloudProfile,
  saveCloudProfile,
  loadCloudChecklist,
  saveCloudChecklist,
} from './cloud-profile-storage';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const PROFILE_A: TaxProfile = {
  taxYear: 2025,
  income: {
    hasCLT: true, hasOtherJobs: false, hasPensionIncome: false,
    hasRentalIncome: false, hasFreelanceIncome: false, hasAbroadIncome: false,
    hasAlimonyReceived: false,
  },
  deductions: {
    hasDependents: false, hasMedicalExpenses: false, hasEducationExpenses: false,
    hasPrivatePension: false, hasAlimonyPaid: false,
  },
  assets: {
    hasRealEstate: false, hasVehicle: false, hasOtherAssets: false,
    hasAbroadAssets: false,
  },
  investments: {
    hasBankAccounts: true, hasStocks: false, hasFIIs: false,
    hasCrypto: false, hasPrivatePension: false, hasEtfs: false,
  },
  special: { hasCapitalGains: false, hasExemptIncome: false, hasLawsuit: false },
};

const PROFILE_B: TaxProfile = { ...PROFILE_A, taxYear: 2025, investments: { ...PROFILE_A.investments, hasStocks: true } };

const USER_ID = 'user-abc-123';

// ---------------------------------------------------------------------------
// decideMigration — pure function, no mocks needed
// ---------------------------------------------------------------------------
describe('decideMigration', () => {
  it('returns "none" when both are null', () => {
    expect(decideMigration(null, null)).toBe('none');
  });

  it('returns "load-cloud" when only cloud data exists', () => {
    expect(decideMigration(null, PROFILE_A)).toBe('load-cloud');
  });

  it('returns "prompt" when only local data exists (no cloud)', () => {
    expect(decideMigration(PROFILE_A, null)).toBe('prompt');
  });

  it('returns "prompt" when both local and cloud exist with different data', () => {
    expect(decideMigration(PROFILE_A, PROFILE_B)).toBe('prompt');
  });

  it('returns "prompt" when both exist with identical data (let user decide)', () => {
    expect(decideMigration(PROFILE_A, PROFILE_A)).toBe('prompt');
  });

  it('returns "load-cloud" for any truthy cloud profile regardless of shape', () => {
    const minimal = { taxYear: 2025 } as TaxProfile;
    expect(decideMigration(null, minimal)).toBe('load-cloud');
  });
});

// ---------------------------------------------------------------------------
// loadCloudProfile
// ---------------------------------------------------------------------------
describe('loadCloudProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when no row found', async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toBeNull();
  });

  it('returns the profile when row exists', async () => {
    mockMaybySingle.mockResolvedValue({ data: { profile: PROFILE_A }, error: null });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toEqual(PROFILE_A);
  });

  it('returns null when maybeSingle returns an error', async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: { message: 'not found' } });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// saveCloudProfile
// ---------------------------------------------------------------------------
describe('saveCloudProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true on successful upsert', async () => {
    mockUpsert.mockResolvedValue({ error: null });
    const ok = await saveCloudProfile(USER_ID, PROFILE_A);
    expect(ok).toBe(true);
  });

  it('returns false when upsert returns an error', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'rls violation' } });
    const ok = await saveCloudProfile(USER_ID, PROFILE_A);
    expect(ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// loadCloudChecklist
// ---------------------------------------------------------------------------
describe('loadCloudChecklist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty object when no row found', async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual({});
  });

  it('returns the checklist_state from the row', async () => {
    const state = { item_1: true, item_2: false };
    mockMaybySingle.mockResolvedValue({ data: { checklist_state: state }, error: null });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual(state);
  });

  it('returns empty object when checklist_state is null', async () => {
    mockMaybySingle.mockResolvedValue({ data: { checklist_state: null }, error: null });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// saveCloudChecklist
// ---------------------------------------------------------------------------
describe('saveCloudChecklist', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true on successful update', async () => {
    mockUpdateEnd.mockResolvedValue({ error: null });
    const ok = await saveCloudChecklist(USER_ID, { item_1: true });
    expect(ok).toBe(true);
  });

  it('returns false when update returns an error', async () => {
    mockUpdateEnd.mockResolvedValue({ error: { message: 'network error' } });
    const ok = await saveCloudChecklist(USER_ID, { item_1: true });
    expect(ok).toBe(false);
  });
});
