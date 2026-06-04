import { ComplexityLevel } from '@/types/tax-profile';

interface BadgeProps {
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
};

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
}

export function ComplexityBadge({ level }: { level: ComplexityLevel }) {
  const map: Record<ComplexityLevel, { label: string; color: 'green' | 'yellow' | 'red' }> = {
    simple: { label: 'Declaração Simples', color: 'green' },
    medium: { label: 'Declaração Média', color: 'yellow' },
    complex: { label: 'Declaração Complexa', color: 'red' },
  };
  const { label, color } = map[level];
  return <Badge label={label} color={color} />;
}
