import { AlertSeverity } from '@/types/alert';
import { ReactNode } from 'react';

interface AlertBoxProps {
  severity: AlertSeverity;
  title: string;
  children?: ReactNode;
}

const styles: Record<AlertSeverity, string> = {
  info: 'bg-info-50 border-info-200 text-info-900 dark:bg-info-950 dark:border-info-800 dark:text-info-100',
  warning: 'bg-warning-50 border-warning-200 text-warning-900 dark:bg-warning-950 dark:border-warning-800 dark:text-warning-100',
  danger: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-950 dark:border-danger-800 dark:text-danger-100',
};

const icons: Record<AlertSeverity, string> = {
  info: 'ℹ',
  warning: '⚠',
  danger: '✕',
};

export default function AlertBox({ severity, title, children }: AlertBoxProps) {
  return (
    <div className={`rounded-lg border p-4 ${styles[severity]}`} role="alert">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 text-lg font-bold" aria-hidden="true">
          {icons[severity]}
        </span>
        <div>
          <p className="font-semibold">{title}</p>
          {children && <p className="mt-1 text-sm opacity-90">{children}</p>}
        </div>
      </div>
    </div>
  );
}
