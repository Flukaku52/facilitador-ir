import { AlertSeverity } from '@/types/alert';
import { ReactNode } from 'react';

interface AlertBoxProps {
  severity: AlertSeverity;
  title: string;
  children?: ReactNode;
}

const styles: Record<AlertSeverity, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100',
  danger: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
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
