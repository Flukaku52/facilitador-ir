import type { Metadata } from "next";
import { Geist, Fraunces } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import ThemeProvider from "@/components/layout/ThemeProvider";
import DeadlineBanner from "@/components/layout/DeadlineBanner";
import AuthHandler from "@/components/layout/AuthHandler";
import ProfileSyncProvider from "@/components/layout/ProfileSyncProvider";
import Link from "next/link";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "IR Facilitador — Declare seu Imposto de Renda sem medo",
  description:
    "Responda algumas perguntas e receba um checklist personalizado dos documentos da sua declaração de IR, com guias em linguagem simples. Grátis pra começar.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: "https://ir-facilitador.vercel.app/",
    locale: "pt_BR",
    title: "Declare seu Imposto de Renda sem medo de cair na malha",
    description:
      "Checklist personalizado dos seus documentos + guias em linguagem simples. Grátis pra começar.",
    images: [{ url: "https://ir-facilitador.vercel.app/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Declare seu Imposto de Renda sem medo de cair na malha",
    description:
      "Checklist personalizado dos seus documentos + guias em linguagem simples. Grátis pra começar.",
    images: ["https://ir-facilitador.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col bg-background font-sans text-foreground"
      >
        <ThemeProvider>
          <AuthHandler />
          <ProfileSyncProvider />
          <DeadlineBanner />
          <AppHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border bg-surface py-6 print:hidden">
            <div className="mx-auto max-w-3xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
              <span>
                IR Facilitador — orientação educacional, não substituição de
                contador.
              </span>
              <nav className="flex gap-4">
                <Link
                  href="/privacidade"
                  className="hover:text-body transition-colors"
                >
                  Privacidade
                </Link>
                <Link
                  href="/termos"
                  className="hover:text-body transition-colors"
                >
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
