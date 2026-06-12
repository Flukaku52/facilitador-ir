'use client';

import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
 variant?: Variant;
 size?: Size;
 fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
 primary:
 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 dark:disabled:bg-primary-800',
 secondary:
 'bg-surface text-primary-600 border border-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:opacity-50 dark:text-primary-400 dark:border-primary-500 dark:hover:bg-slate-800',
 ghost:
 'bg-transparent text-body hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50 dark:text-muted dark:hover:bg-slate-800',
 danger:
 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 disabled:bg-danger-300 dark:bg-danger-700 dark:hover:bg-danger-800',
};

const sizeClasses: Record<Size, string> = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-4 py-2.5 text-base',
 lg: 'px-6 py-3.5 text-lg',
};

export default function Button({
 variant = 'primary',
 size = 'md',
 fullWidth = false,
 className = '',
 children,
 ...props
}: ButtonProps) {
 return (
 <button
 className={[
 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed dark:focus:ring-offset-background',
 variantClasses[variant],
 sizeClasses[size],
 fullWidth ? 'w-full' : '',
 className,
 ]
 .filter(Boolean)
 .join(' ')}
 {...props}
 >
 {children}
 </button>
 );
}
