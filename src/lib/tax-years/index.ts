import * as year2025 from './2025/thresholds';
import * as year2026 from './2026/thresholds';

const TAX_YEARS = {
  2025: year2025,
  2026: year2026,
} as const;

export type SupportedTaxYear = keyof typeof TAX_YEARS;

export function getTaxYearThresholds(year: number) {
  const supported = TAX_YEARS[year as SupportedTaxYear];
  if (supported) return supported;
  // fallback: most recent year
  return year2026;
}

export function getCurrentTaxYear(): number {
  return new Date().getFullYear() - 1;
}

export { year2025, year2026 };
