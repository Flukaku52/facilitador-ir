interface ProgressBarProps {
  value: number;
  label?: string;
  showPercent?: boolean;
}

export default function ProgressBar({ value, label, showPercent = true }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {(label || showPercent) && (
        <div className="mb-1 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          {label && <span>{label}</span>}
          {showPercent && <span>{clamped}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
