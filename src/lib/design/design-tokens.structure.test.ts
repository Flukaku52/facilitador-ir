import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

// Etapa 2 da camada de tokens: garante que a migração está completa e que a
// disciplina se mantém — cores cruas das famílias migradas não voltam nunca.
// Famílias banidas: indigo, red, green, yellow, amber, blue (etapa 1) + gray (etapa 2).
// Famílias permitidas: slate-* (neutro novo), primary/danger/success/warning/premium/info (tokens).

function read(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), "utf-8");
}

function allTsxFiles(): string[] {
  const root = resolve(process.cwd(), "src");
  return (readdirSync(root, { recursive: true }) as string[])
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(root, f));
}

const OLD_FAMILY_RE =
  /\b(indigo|red|green|yellow|amber|blue|gray)-(50|100|200|300|400|500|600|700|800|900|950)\b/;

describe("tokens semânticos — globals.css", () => {
  const css = read("src/app/globals.css");

  it("define os tokens de papel em :root e .dark", () => {
    for (const token of [
      "--background",
      "--surface",
      "--border-default",
      "--foreground",
      "--body",
      "--muted",
    ]) {
      // aparece duas vezes: valor light (:root) e valor dark (.dark)
      const occurrences = css.split(`${token}:`).length - 1;
      expect(occurrences, `${token} em :root e .dark`).toBeGreaterThanOrEqual(
        2,
      );
    }
  });

  it("expõe papéis e escalas como cores Tailwind via @theme", () => {
    for (const token of [
      "--color-background",
      "--color-surface",
      "--color-border",
      "--color-foreground",
      "--color-body",
      "--color-muted",
    ]) {
      expect(css).toContain(token);
    }
    // escala completa por família semântica
    for (const family of [
      "primary",
      "danger",
      "success",
      "warning",
      "premium",
      "info",
    ]) {
      for (const shade of ["50", "500", "950"]) {
        expect(css).toContain(`--color-${family}-${shade}:`);
      }
    }
  });

  it("etapa 2: muted documenta resolução do WCAG AA", () => {
    expect(css).toContain("WCAG AA");
  });

  it("fonte corpo: --font-sans aponta para a variável do next/font", () => {
    expect(css).toContain("--font-sans: var(--font-geist-sans)");
    expect(css).not.toContain("--font-geist-sans: 'Geist'");
    expect(css).not.toContain('--font-geist-sans: "Geist"');
  });

  it("etapa 2: --font-display aponta para Fraunces do next/font", () => {
    expect(css).toContain("--font-display: var(--font-fraunces)");
  });

  it("etapa 2: h1 e h2 usam font-display no @layer base", () => {
    // formatter pode colocar h1 e h2 em linhas separadas
    expect(css).toMatch(/h1[\s,\n]+h2/);
    expect(css).toContain("font-family: var(--font-display");
  });
});

describe("migração completa — nenhum tsx usa as famílias antigas (incl. gray)", () => {
  it("zero ocorrências de indigo|red|green|yellow|amber|blue|gray-<tom> em src/**/*.tsx", () => {
    const offenders: string[] = [];
    for (const file of allTsxFiles()) {
      const src = readFileSync(file, "utf-8");
      const match = src.match(OLD_FAMILY_RE);
      if (match) offenders.push(`${file}: ${match[0]}`);
    }
    expect(offenders).toEqual([]);
  });
});

describe("paleta do PDF centralizada", () => {
  it("ReportPDF.tsx não tem hex inline e importa PDF_COLORS", () => {
    const src = read("src/components/report/ReportPDF.tsx");
    expect(src).not.toMatch(/#[0-9A-Fa-f]{6}\b/);
    expect(src).toContain("@/lib/design/pdf-colors");
  });

  it("pdf-colors.ts é a única fonte, com as chaves semânticas esperadas", () => {
    const src = read("src/lib/design/pdf-colors.ts");
    for (const key of [
      "primary",
      "foreground",
      "body",
      "muted",
      "border",
      "background",
      "successBg",
      "warningBg",
      "dangerBg",
      "infoBg",
    ]) {
      expect(src).toContain(`${key}:`);
    }
  });
});
