import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Testes estruturais (mesmo padrão de ask-rate-limit.test.ts): garantem que o
// gating premium está ligado nos pontos certos do código-fonte.

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf-8");
}

describe("gating dos guias", () => {
  const guidePageSrc = read("src/app/guias/[slug]/page.tsx");
  const gatedSectionsSrc = read("src/components/guides/GuideGatedSections.tsx");

  it("página do guia passa apenas slug para GuideGatedSections (guide inteiro não vaza no RSC)", () => {
    expect(guidePageSrc).toContain("<GuideGatedSections slug=");
    expect(guidePageSrc).not.toContain("guide={guide}");
    // As 4 seções travadas não são renderizadas no server da página
    expect(guidePageSrc).not.toContain("documentsNeeded");
    expect(guidePageSrc).not.toContain("howToFill");
    expect(guidePageSrc).not.toContain("commonMistakes");
    expect(guidePageSrc).not.toContain("whereToDeclare");
  });

  it("página do guia mantém as seções livres (explicação e contador) fora do gating", () => {
    expect(guidePageSrc).toContain("plainLanguageExplanation");
    expect(guidePageSrc).toContain("whenToCallAccountant");
  });

  it("GuideGatedSections recebe slug, não o objeto guide", () => {
    expect(gatedSectionsSrc).toContain("{ slug }: { slug: string }");
    expect(gatedSectionsSrc).not.toContain("guide: Guide");
  });

  it("conteúdo travado só vem do fetch da API, nunca embutido no componente", () => {
    expect(gatedSectionsSrc).toContain("/api/guias/");
    expect(gatedSectionsSrc).toContain("premium-sections");
    // renderiza a partir da resposta (data.*), não de um guide estático
    expect(gatedSectionsSrc).not.toContain("guide.documentsNeeded");
    expect(gatedSectionsSrc).not.toContain("guide.howToFill");
    expect(gatedSectionsSrc).not.toContain("guide.commonMistakes");
    expect(gatedSectionsSrc).not.toContain("guide.whereToDeclare");
  });

  it("convidado/não-premium não dispara o fetch (guard !user || !isPremium antes)", () => {
    expect(gatedSectionsSrc).toContain("if (!user || !isPremium) return;");
  });

  it("gating não usa classes de blur sobre o texto real", () => {
    // Classes Tailwind de desfoque (blur-sm, blur-md, backdrop-blur...) são proibidas:
    // conteúdo bloqueado não é renderizado, em vez de borrado.
    expect(gatedSectionsSrc).not.toMatch(
      /[\s"']blur(-\w+)?[\s"']|backdrop-blur/,
    );
  });
});

describe("gating server-side da rota premium-sections", () => {
  const routeSrc = read("src/app/api/guias/[slug]/premium-sections/route.ts");

  it("autentica via getUser ANTES de materializar o conteúdo travado", () => {
    const idxAuth = routeSrc.indexOf("auth.getUser()");
    const idxContent = routeSrc.indexOf("getPremiumGuideSections(");
    expect(idxAuth).toBeGreaterThan(0);
    expect(idxContent).toBeGreaterThan(0);
    expect(idxAuth).toBeLessThan(idxContent);
  });

  it("checa isPremiumActive ANTES de materializar o conteúdo travado", () => {
    const idxPremium = routeSrc.indexOf("isPremiumActive(");
    const idxContent = routeSrc.indexOf("getPremiumGuideSections(");
    expect(idxPremium).toBeGreaterThan(0);
    expect(idxPremium).toBeLessThan(idxContent);
  });

  it("é dinâmica e não-cacheável (no-store) para não vazar via CDN", () => {
    expect(routeSrc).toContain('export const dynamic = "force-dynamic"');
    expect(routeSrc).toContain("private, no-store");
  });

  it("usa o cliente cookie-scoped do servidor sob RLS (sem service role)", () => {
    expect(routeSrc).toContain('from "@/lib/supabase/server"');
    expect(routeSrc).not.toContain("SERVICE_ROLE");
  });
});

describe("gating do PDF no relatório", () => {
  const reportSrc = read("src/app/relatorio/page.tsx");

  it("DownloadPDFButton só renderiza quando isPremium", () => {
    const idxCondition = reportSrc.indexOf("isPremium ?");
    const idxButton = reportSrc.indexOf("<DownloadPDFButton");
    expect(idxCondition).toBeGreaterThan(0);
    expect(idxButton).toBeGreaterThan(0);
    expect(idxCondition).toBeLessThan(idxButton);
  });

  it("não-premium vê o botão bloqueado com CTA", () => {
    expect(reportSrc).toContain("PdfLockedButton");
  });
});

describe("gating da impressão no relatório", () => {
  const reportSrc = read("src/app/relatorio/page.tsx");

  it("premium dispara window.print normalmente (handler único, intacto)", () => {
    // printReport continua existindo e é o único lugar que chama window.print
    expect(reportSrc.match(/window\.print\(\)/g)).toHaveLength(1);
    expect(reportSrc.match(/onClick=\{printReport\}/g)).toHaveLength(1);
  });

  it("não-premium não dispara window.print: botão Imprimir só renderiza dentro do ramo isPremium", () => {
    const idxHandler = reportSrc.indexOf("onClick={printReport}");
    const idxCondition = reportSrc.lastIndexOf("isPremium ?", idxHandler);
    const idxPdfLocked = reportSrc.indexOf("<PdfLockedButton");
    expect(idxHandler).toBeGreaterThan(0);
    expect(idxCondition).toBeGreaterThan(0);
    // O condicional imediatamente antes do handler vem DEPOIS do bloco do PDF,
    // ou seja, é um `isPremium ?` próprio do botão Imprimir, não o do PDF.
    expect(idxCondition).toBeGreaterThan(idxPdfLocked);
    expect(idxCondition).toBeLessThan(idxHandler);
  });

  it("não-premium vê 🔒 Imprimir levando ao upgrade, sem o diálogo de impressão", () => {
    expect(reportSrc).toContain("Imprimir");
    expect(reportSrc).toContain("🔒");
    // O ramo bloqueado usa upgradeHref (link para /premium ou cadastro), não printReport
    const idxLockedPrint = reportSrc.indexOf("</span> Imprimir");
    const idxUpgradeHref = reportSrc.lastIndexOf("upgradeHref", idxLockedPrint);
    const idxHandler = reportSrc.indexOf("onClick={printReport}");
    expect(idxLockedPrint).toBeGreaterThan(0);
    // O link bloqueado vem depois do botão premium (ramo : do mesmo condicional)
    expect(idxUpgradeHref).toBeGreaterThan(idxHandler);
  });
});

describe("convidado nunca vê premium (guardas explícitas !user)", () => {
  it("usePremium: ramo !user retorna isPremium: false antes de qualquer chamada a isPremiumActive", () => {
    const src = read("src/lib/hooks/usePremium.ts");
    const idxGuestReturn = src.indexOf("isPremium: false");
    const idxActiveCall = src.indexOf("isPremiumActive(");
    expect(idxGuestReturn).toBeGreaterThan(0);
    expect(idxActiveCall).toBeGreaterThan(0);
    expect(idxGuestReturn).toBeLessThan(idxActiveCall);
  });

  it("usePremium: efeito não busca entitlement sem user", () => {
    const src = read("src/lib/hooks/usePremium.ts");
    const idxEffectGuard = src.indexOf("if (!user) return;");
    const idxLoad = src.indexOf("loadEntitlement(");
    // O import de loadEntitlement vem antes; a chamada relevante é a última ocorrência
    const idxLoadCall = src.lastIndexOf("loadEntitlement(");
    expect(idxEffectGuard).toBeGreaterThan(0);
    expect(idxLoad).toBeGreaterThan(0);
    expect(idxEffectGuard).toBeLessThan(idxLoadCall);
  });

  it("GuideGatedSections bloqueia com !user || !isPremium", () => {
    expect(read("src/components/guides/GuideGatedSections.tsx")).toContain(
      "!user || !isPremium",
    );
  });

  it("relatorio: PDF e Imprimir exigem user && isPremium", () => {
    const reportSrc = read("src/app/relatorio/page.tsx");
    const matches = reportSrc.match(/user && isPremium \? \(/g) ?? [];
    expect(matches).toHaveLength(2);
  });
});

describe("CTAs de upgrade", () => {
  it("dashboard tem CTA junto da classificação", () => {
    expect(read("src/app/dashboard/page.tsx")).toContain("<UpgradeCta");
  });

  it("lista de guias tem CTA no topo", () => {
    expect(read("src/app/guias/page.tsx")).toContain("<UpgradeCta");
  });

  it("relatório tem CTA", () => {
    expect(read("src/app/relatorio/page.tsx")).toContain("<UpgradeCta");
  });

  it("convidado é enviado para criar conta antes de /premium", () => {
    expect(read("src/components/premium/UpgradeCta.tsx")).toContain(
      "/cadastro?next=/premium",
    );
  });
});

describe("página /premium e link Kiwify", () => {
  const constantsSrc = read("src/lib/premium/constants.ts");
  const premiumPageSrc = read("src/app/premium/page.tsx");

  it("o placeholder do Kiwify é uma constante única em constants.ts", () => {
    expect(constantsSrc).toContain("PLACEHOLDER_LINK_KIWIFY");
    // A página usa a constante, não o literal — trocar o link = editar 1 arquivo
    expect(premiumPageSrc).toContain("KIWIFY_CHECKOUT_URL");
    expect(premiumPageSrc).not.toContain("PLACEHOLDER_LINK_KIWIFY");
  });

  it("página /premium mantém o disclaimer educacional", () => {
    expect(premiumPageSrc).toContain("LegalDisclaimer");
  });

  it("página /premium avisa que a liberação é manual", () => {
    expect(premiumPageSrc).toContain("manualmente");
  });
});

describe("migration do user_entitlements — RLS só-leitura", () => {
  const migrationSrc = read(
    "supabase/migrations/20260611120000_add_user_entitlements.sql",
  );

  it("RLS habilitado com policy apenas de SELECT", () => {
    expect(migrationSrc).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migrationSrc).toContain("FOR SELECT");
    // Nenhuma policy de escrita: usuário não altera o próprio entitlement
    expect(migrationSrc).not.toContain("FOR INSERT");
    expect(migrationSrc).not.toContain("FOR UPDATE");
    expect(migrationSrc).not.toContain("FOR DELETE");
  });

  it("premium_until é date nullable (NULL = sem expiração)", () => {
    expect(migrationSrc).toContain("premium_until date");
    expect(migrationSrc).not.toContain("premium_until date NOT NULL");
  });
});
