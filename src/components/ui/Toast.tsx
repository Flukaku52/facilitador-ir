"use client";

interface ToastProps {
  message: string;
  show: boolean;
}

export default function Toast({ message, show }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 dark:bg-slate-100 dark:text-slate-900 ${
        show
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
