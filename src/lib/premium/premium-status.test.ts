import { describe, it, expect } from "vitest";
import {
  isPremiumActive,
  isGuideSectionVisible,
  FREE_GUIDE_SECTIONS,
  LOCKED_GUIDE_SECTIONS,
  type GuideSectionKey,
  type PremiumEntitlement,
} from "./premium-status";

// Data fixa para testes determinísticos (11 de junho de 2026, horário local)
const TODAY = new Date(2026, 5, 11);

const ALL_SECTIONS: GuideSectionKey[] = [
  ...FREE_GUIDE_SECTIONS,
  ...LOCKED_GUIDE_SECTIONS,
];

describe("isPremiumActive", () => {
  it("null/undefined entitlement => não-premium (fail-closed)", () => {
    expect(isPremiumActive(null, TODAY)).toBe(false);
    expect(isPremiumActive(undefined, TODAY)).toBe(false);
  });

  it("is_premium=false => não-premium, mesmo com data futura", () => {
    expect(
      isPremiumActive({ is_premium: false, premium_until: null }, TODAY),
    ).toBe(false);
    expect(
      isPremiumActive(
        { is_premium: false, premium_until: "2099-12-31" },
        TODAY,
      ),
    ).toBe(false);
  });

  it("is_premium=true com premium_until NULL => ativo (sem expiração)", () => {
    expect(
      isPremiumActive({ is_premium: true, premium_until: null }, TODAY),
    ).toBe(true);
  });

  it("is_premium=true com data futura => ativo", () => {
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2026-12-31" }, TODAY),
    ).toBe(true);
  });

  it("premium_until = hoje => ainda ativo (inclusivo)", () => {
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2026-06-11" }, TODAY),
    ).toBe(true);
  });

  it("premium_until expirado => volta a bloquear", () => {
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2026-06-10" }, TODAY),
    ).toBe(false);
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2025-12-31" }, TODAY),
    ).toBe(false);
  });

  it("comparação ignora a hora do dia (23:59 do dia da expiração ainda é ativo)", () => {
    const lateToday = new Date(2026, 5, 11, 23, 59, 59);
    expect(
      isPremiumActive(
        { is_premium: true, premium_until: "2026-06-11" },
        lateToday,
      ),
    ).toBe(true);
  });

  it("data em formato inválido => não-premium (fail-closed)", () => {
    const bad: PremiumEntitlement = {
      is_premium: true,
      premium_until: "31/05/2026",
    };
    expect(isPremiumActive(bad, TODAY)).toBe(false);
    expect(
      isPremiumActive({ is_premium: true, premium_until: "zzz" }, TODAY),
    ).toBe(false);
    expect(
      isPremiumActive({ is_premium: true, premium_until: "" }, TODAY),
    ).toBe(false);
  });

  it("usa a data corrente como default quando today é omitido", () => {
    // Sem expiração: independe da data corrente
    expect(isPremiumActive({ is_premium: true, premium_until: null })).toBe(
      true,
    );
    // Data muito no futuro / muito no passado: estável por décadas
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2099-12-31" }),
    ).toBe(true);
    expect(
      isPremiumActive({ is_premium: true, premium_until: "2000-01-01" }),
    ).toBe(false);
  });
});

describe("seções dos guias — free vs bloqueadas", () => {
  it("as 4 seções bloqueadas são exatamente Documentos/Onde declarar/Como preencher/Erros comuns", () => {
    expect([...LOCKED_GUIDE_SECTIONS].sort()).toEqual(
      [
        "commonMistakes",
        "documentsNeeded",
        "howToFill",
        "whereToDeclare",
      ].sort(),
    );
  });

  it("as seções livres são exatamente a explicação e quando chamar contador", () => {
    expect([...FREE_GUIDE_SECTIONS].sort()).toEqual(
      ["plainLanguageExplanation", "whenToCallAccountant"].sort(),
    );
  });

  it("não há sobreposição entre seções livres e bloqueadas", () => {
    const overlap = FREE_GUIDE_SECTIONS.filter((s) =>
      (LOCKED_GUIDE_SECTIONS as readonly string[]).includes(s),
    );
    expect(overlap).toEqual([]);
    expect(new Set(ALL_SECTIONS).size).toBe(ALL_SECTIONS.length);
  });

  it("premium vê todas as seções", () => {
    for (const section of ALL_SECTIONS) {
      expect(isGuideSectionVisible(section, true)).toBe(true);
    }
  });

  it("não-premium vê apenas as seções livres", () => {
    for (const section of FREE_GUIDE_SECTIONS) {
      expect(isGuideSectionVisible(section, false)).toBe(true);
    }
    for (const section of LOCKED_GUIDE_SECTIONS) {
      expect(isGuideSectionVisible(section, false)).toBe(false);
    }
  });
});
