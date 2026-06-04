import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import AppHeader from '@/components/layout/AppHeader';

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
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-gray-50 font-sans">
        <AppHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
          IR Facilitador — orientação educacional, não substituição de contador.
        </footer>
      </body>
    </html>
  );
}
