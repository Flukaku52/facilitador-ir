import { ComplexityLevel } from '@/types/tax-profile';

interface BadgeProps {
 label: string;
 color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

const colorClasses: Record<string, string> = {
 green: 'bg-success-100 text-success-800 dark:bg-success-950 dark:text-success-300',
 yellow: 'bg-warning-100 text-warning-800 dark:bg-warning-950 dark:text-warning-300',
 red: 'bg-danger-100 text-danger-800 dark:bg-danger-950 dark:text-danger-300',
 blue: 'bg-info-100 text-info-800 dark:bg-info-950 dark:text-info-300',
 gray: 'bg-slate-100 text-body dark:bg-slate-800',
};

export default function Badge({ label, color = 'gray' }: BadgeProps) {
 return (
 <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${colorClasses[color]}`}>
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
