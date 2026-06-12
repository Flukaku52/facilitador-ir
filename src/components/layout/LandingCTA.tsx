'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function LandingCTA() {
 const { user, loading } = useAuth();

 if (loading) {
 return (
 <div className="mt-8">
 <div className="mx-auto h-14 w-56 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-700" />
 </div>
 );
 }

 if (user) {
 return (
 <div className="mt-8">
 <Link
 href="/dashboard"
 className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Continuar declaração →
 </Link>
 </div>
 );
 }

 return (
 <>
 <div className="mt-8">
 <Link
 href="/questionario"
 className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 transition-colors dark:bg-primary-500 dark:hover:bg-primary-600"
 >
 Começar diagnóstico gratuito
 </Link>
 </div>
 <p className="mt-3 text-sm text-muted">Leva cerca de 3 minutos. Sem cadastro.</p>
 </>
 );
}
