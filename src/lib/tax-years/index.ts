import * as year2025 from './2025/thresholds';
import * as year2026 from './2026/thresholds';

// Semântica de anos neste projeto:
//
//   taxYear / getCurrentTaxYear() / profile.taxYear
//     = BASE_YEAR = ano-calendário = ano em que a renda foi auferida
//     Exemplo: em junho de 2026, getCurrentTaxYear() = 2025 (renda de 2025)
//
//   TAX_YEAR (dentro de cada arquivo de thresholds)
//     = ano de exercício = ano em que a declaração é entregue ao Fisco
//     Exemplo: TAX_YEAR = 2026 → declaração entregue em 2026
//
//   BASE_YEAR (dentro de cada arquivo de thresholds)
//     = ano-calendário = ano da renda declarada
//     Exemplo: BASE_YEAR = 2025 → renda auferida em 2025
//
// A chave deste mapa é o BASE_YEAR (ano-calendário = taxYear do perfil).
// Isso garante que getTaxYearThresholds(profile.taxYear) carregue o
// arquivo correto para a renda do usuário.
//
// Exemplo correto em junho de 2026:
//   getCurrentTaxYear()     = 2025           (ano-base 2025)
//   getTaxYearThresholds(2025) → year2026    (BASE_YEAR=2025, TAX_YEAR=2026)
//   Threshold aplicado: IRPF 2026 ✓
const BASE_YEAR_MAP = {
  [year2025.BASE_YEAR]: year2025, // BASE_YEAR 2024 → IRPF 2025 (exercício 2025)
  [year2026.BASE_YEAR]: year2026, // BASE_YEAR 2025 → IRPF 2026 (exercício 2026)
} as const;

type SupportedBaseYear = keyof typeof BASE_YEAR_MAP;

// Recebe o ano-base (ano-calendário da renda; equivalente a profile.taxYear)
// e retorna os thresholds do exercício correspondente.
// Fallback para o exercício mais recente disponível quando o ano-base não tem arquivo.
export function getTaxYearThresholds(baseYear: number) {
  const thresholds = BASE_YEAR_MAP[baseYear as SupportedBaseYear];
  if (thresholds) return thresholds;
  return year2026; // fallback: exercício mais recente disponível
}

// Retorna o ano-base atual: ano em que a renda foi auferida.
// Em junho de 2026: retorna 2025 (renda de 2025 → declaração IRPF 2026).
export function getCurrentTaxYear(): number {
  return new Date().getFullYear() - 1;
}

export { year2025, year2026 };
