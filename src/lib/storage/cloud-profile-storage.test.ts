import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TaxProfile } from "@/types/tax-profile";

// ---------------------------------------------------------------------------
// Mock Supabase client
// vi.hoisted runs before vi.mock factories, making the spies accessible there.
// ---------------------------------------------------------------------------
const { mockMaybySingle, mockUpsert, mockUpdateEnd } = vi.hoisted(() => ({
  mockMaybySingle: vi.fn<() => Promise<{ data: unknown; error: unknown }>>(),
  mockUpsert: vi.fn<(...args: unknown[]) => Promise<{ error: unknown }>>(),
  mockUpdateEnd: vi.fn<(...args: unknown[]) => Promise<{ error: unknown }>>(),
}));

vi.mock("@/lib/supabase/client", () => ({
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
} from "./cloud-profile-storage";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const PROFILE_A: TaxProfile = {
  id: "profile-a",
  taxYear: 2025,
  income: {
    hasCltIncome: true,
    hasBusinessIncome: false,
    hasSelfEmploymentIncome: false,
    hasRentIncome: false,
    hasPensionOrRetirement: false,
    hasOtherIncome: false,
  },
  assets: {
    hasBankAccounts: true,
    hasInvestments: false,
    hasProperty: false,
    hasFinancedProperty: false,
    hasVehicle: false,
    hasCrypto: false,
    hasForeignAssets: false,
  },
  investments: {
    hasFixedIncome: false,
    hasStocks: false,
    hasFiis: false,
    hasEtfs: false,
    hasPrivatePension: false,
    soldVariableIncome: false,
  },
  deductions: {
    hasDependents: false,
    hasMedicalExpenses: false,
    hasEducationExpenses: false,
    hasInformalEducation: false,
    hasPrivatePensionContributions: false,
    hasAlimony: false,
  },
  documents: {
    hasCltIncomeReport: false,
    hasBankReports: false,
    hasBrokerReports: false,
    hasMedicalReceipts: false,
    hasPropertyDocuments: false,
  },
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

const PROFILE_B: TaxProfile = {
  ...PROFILE_A,
  taxYear: 2025,
  investments: { ...PROFILE_A.investments, hasStocks: true },
};

const USER_ID = "user-abc-123";

// ---------------------------------------------------------------------------
// decideMigration — pure function, no mocks needed
// ---------------------------------------------------------------------------
describe("decideMigration", () => {
  it('returns "none" when both are null', () => {
    expect(decideMigration(null, null)).toBe("none");
  });

  it('returns "load-cloud" when only cloud data exists', () => {
    expect(decideMigration(null, PROFILE_A)).toBe("load-cloud");
  });

  it('returns "prompt" when only local data exists (no cloud)', () => {
    expect(decideMigration(PROFILE_A, null)).toBe("prompt");
  });

  it('returns "prompt" when both local and cloud exist with different data', () => {
    expect(decideMigration(PROFILE_A, PROFILE_B)).toBe("prompt");
  });

  it('returns "prompt" when both exist with identical data (let user decide)', () => {
    expect(decideMigration(PROFILE_A, PROFILE_A)).toBe("prompt");
  });

  it('returns "load-cloud" for any truthy cloud profile regardless of shape', () => {
    const minimal = { taxYear: 2025 } as TaxProfile;
    expect(decideMigration(null, minimal)).toBe("load-cloud");
  });
});

// ---------------------------------------------------------------------------
// loadCloudProfile
// ---------------------------------------------------------------------------
describe("loadCloudProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no row found", async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toBeNull();
  });

  it("returns the profile when row exists", async () => {
    mockMaybySingle.mockResolvedValue({
      data: { profile: PROFILE_A },
      error: null,
    });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toEqual(PROFILE_A);
  });

  it("returns null when maybeSingle returns an error", async () => {
    mockMaybySingle.mockResolvedValue({
      data: null,
      error: { message: "not found" },
    });
    const result = await loadCloudProfile(USER_ID);
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// saveCloudProfile
// ---------------------------------------------------------------------------
describe("saveCloudProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true on successful upsert", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    const ok = await saveCloudProfile(USER_ID, PROFILE_A);
    expect(ok).toBe(true);
  });

  it("returns false when upsert returns an error", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "rls violation" } });
    const ok = await saveCloudProfile(USER_ID, PROFILE_A);
    expect(ok).toBe(false);
  });

  it("usa profile.taxYear no payload do upsert — não hardcoded", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    const profile2026 = { ...PROFILE_A, taxYear: 2026 };
    await saveCloudProfile(USER_ID, profile2026);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: USER_ID, tax_year: 2026 }),
    );
  });

  it("tax_year no upsert reflete o taxYear do profile (2024)", async () => {
    mockUpsert.mockResolvedValue({ error: null });
    const profile2024 = { ...PROFILE_A, taxYear: 2024 };
    await saveCloudProfile(USER_ID, profile2024);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ tax_year: 2024 }),
    );
  });
});

// ---------------------------------------------------------------------------
// loadCloudChecklist
// ---------------------------------------------------------------------------
describe("loadCloudChecklist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty object when no row found", async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual({});
  });

  it("returns the checklist_state from the row", async () => {
    const state = { item_1: true, item_2: false };
    mockMaybySingle.mockResolvedValue({
      data: { checklist_state: state },
      error: null,
    });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual(state);
  });

  it("returns empty object when checklist_state is null", async () => {
    mockMaybySingle.mockResolvedValue({
      data: { checklist_state: null },
      error: null,
    });
    const result = await loadCloudChecklist(USER_ID);
    expect(result).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// saveCloudChecklist
// ---------------------------------------------------------------------------
describe("saveCloudChecklist", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true on successful update", async () => {
    mockUpdateEnd.mockResolvedValue({ error: null });
    const ok = await saveCloudChecklist(USER_ID, { item_1: true });
    expect(ok).toBe(true);
  });

  it("returns false when update returns an error", async () => {
    mockUpdateEnd.mockResolvedValue({ error: { message: "network error" } });
    const ok = await saveCloudChecklist(USER_ID, { item_1: true });
    expect(ok).toBe(false);
  });

  it("aceita taxYear explícito sem lançar erro", async () => {
    mockUpdateEnd.mockResolvedValue({ error: null });
    await expect(
      saveCloudChecklist(USER_ID, { item_1: true }, 2025),
    ).resolves.toBe(true);
  });
});

// ---------------------------------------------------------------------------
// taxYear dinâmico — parâmetro opcional nas funções de leitura
// ---------------------------------------------------------------------------
describe("taxYear dinâmico — parâmetros opcionais", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loadCloudProfile aceita taxYear explícito", async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    await expect(loadCloudProfile(USER_ID, 2025)).resolves.toBeNull();
  });

  it("loadCloudProfile usa default (getCurrentTaxYear) quando taxYear omitido", async () => {
    mockMaybySingle.mockResolvedValue({
      data: { profile: PROFILE_A },
      error: null,
    });
    await expect(loadCloudProfile(USER_ID)).resolves.toEqual(PROFILE_A);
  });

  it("loadCloudChecklist aceita taxYear explícito", async () => {
    mockMaybySingle.mockResolvedValue({ data: null, error: null });
    await expect(loadCloudChecklist(USER_ID, 2025)).resolves.toEqual({});
  });

  it("loadCloudChecklist usa default quando taxYear omitido", async () => {
    const state = { item_x: true };
    mockMaybySingle.mockResolvedValue({
      data: { checklist_state: state },
      error: null,
    });
    await expect(loadCloudChecklist(USER_ID)).resolves.toEqual(state);
  });
});
