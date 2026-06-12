import { describe, it, expect } from "vitest";
import { getPremiumGuideSections } from "./guide-sections";
import { GUIDES } from "@/lib/data/guides";

describe("getPremiumGuideSections", () => {
  it("retorna as 4 seções travadas para um slug válido", () => {
    const slug = GUIDES[0].slug;
    const sections = getPremiumGuideSections(slug);
    expect(sections).not.toBeNull();
    expect(sections).toEqual({
      documentsNeeded: GUIDES[0].documentsNeeded,
      whereToDeclare: GUIDES[0].whereToDeclare,
      howToFill: GUIDES[0].howToFill,
      commonMistakes: GUIDES[0].commonMistakes,
    });
  });

  it("não inclui seções livres nem campos extras do guia", () => {
    const sections = getPremiumGuideSections(GUIDES[0].slug)!;
    expect(Object.keys(sections).sort()).toEqual(
      [
        "commonMistakes",
        "documentsNeeded",
        "howToFill",
        "whereToDeclare",
      ].sort(),
    );
    expect(sections).not.toHaveProperty("plainLanguageExplanation");
    expect(sections).not.toHaveProperty("whenToCallAccountant");
  });

  it("retorna null para slug inexistente", () => {
    expect(getPremiumGuideSections("slug-que-nao-existe")).toBeNull();
  });
});
