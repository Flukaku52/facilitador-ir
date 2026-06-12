import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';
import ThemeProvider from '@/components/layout/ThemeProvider';
import DeadlineBanner from '@/components/layout/DeadlineBanner';
import AuthHandler from '@/components/layout/AuthHandler';
import ProfileSyncProvider from '@/components/layout/ProfileSyncProvider';
import Link from 'next/link';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IR Facilitador — Imposto de Renda sem complicação',
  description:
    'Responda perguntas simples e receba um checklist personalizado, guias de preenchimento e alertas de risco para organizar sua declaração de Imposto de Renda.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-background font-sans dark:text-gray-100">
        <ThemeProvider>
          <AuthHandler />
          <ProfileSyncProvider />
          <DeadlineBanner />
          <AppHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-surface py-6 dark:border-gray-800 print:hidden">
            <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 dark:text-gray-600">
              <span>IR Facilitador — orientação educacional, não substituição de contador.</span>
              <nav className="flex gap-4">
                <Link href="/privacidade" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                  Privacidade
                </Link>
                <Link href="/termos" className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                  Termos de Uso
                </Link>
              </nav>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
