import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';
import ThemeProvider from '@/components/layout/ThemeProvider';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IR Facilitador — Imposto de Renda sem complicação',
  description:
    'Responda perguntas simples e receba um checklist personalizado, guias de preenchimento e alertas de risco para organizar sua declaração de Imposto de Renda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-gray-50 font-sans dark:bg-gray-950 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <AppHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-600">
            IR Facilitador — orientação educacional, não substituição de contador.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
