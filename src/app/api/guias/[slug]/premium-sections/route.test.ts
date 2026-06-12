import { describe, it, expect, vi, beforeEach } from "vitest";
import { GUIDES } from "@/lib/data/guides";

// Mocka só a camada de IO (cliente Supabase server-side). isPremiumActive e
// getPremiumGuideSections rodam de verdade.
const { mockCreateClient, mockGetUser, mockMaybeSingle } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockGetUser: vi.fn(),
  mockMaybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

import { GET } from "./route";

const VALID_SLUG = GUIDES[0].slug;
const LOCKED_KEYS = [
  "documentsNeeded",
  "whereToDeclare",
  "howToFill",
  "commonMistakes",
];

function supabaseStub() {
  return {
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  };
}

function call(slug: string) {
  return GET(
    new Request(`http://localhost/api/guias/${slug}/premium-sections`),
    { params: Promise.resolve({ slug }) },
  );
}

function asGuest() {
  mockGetUser.mockResolvedValue({ data: { user: null } });
}
function asUser(entitlement: unknown, error: unknown = null) {
  mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
  mockMaybeSingle.mockResolvedValue({ data: entitlement, error });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateClient.mockResolvedValue(supabaseStub());
});

describe("GET /api/guias/[slug]/premium-sections", () => {
  it("convidado (sem sessão) => 403 e nenhum byte de conteúdo travado", async () => {
    asGuest();
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(403);
    const body = await res.json();
    for (const key of LOCKED_KEYS) expect(body).not.toHaveProperty(key);
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("logado sem premium => 403 sem conteúdo", async () => {
    asUser({ is_premium: false, premium_until: null });
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(403);
    const body = await res.json();
    for (const key of LOCKED_KEYS) expect(body).not.toHaveProperty(key);
  });

  it("premium expirado => 403 (volta a bloquear)", async () => {
    asUser({ is_premium: true, premium_until: "2000-01-01" });
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(403);
  });

  it("premium ativo (sem expiração) => 200 com as 4 seções", async () => {
    asUser({ is_premium: true, premium_until: null });
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      documentsNeeded: GUIDES[0].documentsNeeded,
      whereToDeclare: GUIDES[0].whereToDeclare,
      howToFill: GUIDES[0].howToFill,
      commonMistakes: GUIDES[0].commonMistakes,
    });
    expect(res.headers.get("cache-control")).toBe("private, no-store");
  });

  it("premium com slug inexistente => 404", async () => {
    asUser({ is_premium: true, premium_until: null });
    const res = await call("slug-que-nao-existe");
    expect(res.status).toBe(404);
  });

  it("erro ao ler entitlement => 403 (fail-closed)", async () => {
    asUser(null, { message: "rls denied" });
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(403);
  });

  it("Supabase não configurado (createClient lança) => 403", async () => {
    mockCreateClient.mockRejectedValueOnce(new Error("no supabase"));
    const res = await call(VALID_SLUG);
    expect(res.status).toBe(403);
  });
});
