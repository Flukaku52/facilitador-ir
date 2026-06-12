'use client';

import { useMemo } from 'react';
import { getTaxYearThresholds, getCurrentTaxYear } from '@/lib/tax-years';

function formatDiff(deadline: Date): { label: string; urgent: boolean; past: boolean } {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    return { label: `Prazo ${deadline.getFullYear()} encerrado`, urgent: false, past: true };
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const urgent = days <= 30;

  if (days === 1) return { label: 'Prazo vence amanhã!', urgent: true, past: false };
  if (days <= 7) return { label: `Prazo em ${days} dias`, urgent: true, past: false };
  return { label: `${days} dias para o prazo da declaração`, urgent, past: false };
}

export default function DeadlineBanner() {
  const { label, urgent, past } = useMemo(() => {
    const thresholds = getTaxYearThresholds(getCurrentTaxYear());
    return formatDiff(thresholds.FILING_DEADLINE);
  }, []);

  if (past) return null;

  return (
    <div
      className={`text-center py-2 text-sm font-medium ${
        urgent
          ? 'bg-danger-50 text-danger-700 dark:bg-danger-950 dark:text-danger-300'
          : 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
      }`}
    >
      {label}
    </div>
  );
}
