import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockMaybeSingle } = vi.hoisted(() => ({
  mockMaybeSingle: vi.fn<() => Promise<{ data: unknown; error: unknown }>>(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  }),
}));

import { loadEntitlement } from "./premium-storage";

const USER_ID = "user-abc-123";

describe("loadEntitlement", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna o entitlement quando a linha existe", async () => {
    const row = { is_premium: true, premium_until: "2026-05-31" };
    mockMaybeSingle.mockResolvedValue({ data: row, error: null });
    await expect(loadEntitlement(USER_ID)).resolves.toEqual(row);
  });

  it("retorna null quando não há linha (usuário nunca foi liberado)", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(loadEntitlement(USER_ID)).resolves.toBeNull();
  });

  it("retorna null em erro de rede/permissão (fail-closed)", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    });
    await expect(loadEntitlement(USER_ID)).resolves.toBeNull();
  });

  it("retorna null mesmo se vier data junto com erro (erro tem precedência)", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { is_premium: true, premium_until: null },
      error: { message: "rls violation" },
    });
    await expect(loadEntitlement(USER_ID)).resolves.toBeNull();
  });
});
