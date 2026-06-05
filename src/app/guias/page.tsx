'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { GUIDES } from '@/lib/data/guides';
import { Guide } from '@/types/guide';
import { useStoredProfile } from '@/lib/hooks/useStoredProfile';
import { getApplicableGuideSlugs } from '@/lib/rules/tax-rules';
import GuideCard from '@/components/guides/GuideCard';
import { GuidesSkeleton } from '@/components/ui/Skeleton';

export default function GuidesPage() {
  const profile = useStoredProfile();

  const guides: Guide[] = useMemo(() => {
    if (profile) {
      const slugs = getApplicableGuideSlugs(profile);
      return GUIDES.filter((g) => slugs.includes(g.slug));
    }
    return GUIDES;
  }, [profile]);

  if (guides.length === 0 && !profile) return <GuidesSkeleton />;

  const alertGuides = guides.filter((g) => g.isAlert);
  const regularGuides = guides.filter((g) => !g.isAlert);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guias de preenchimento</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {guides.length} guia{guides.length !== 1 ? 's' : ''} para o seu perfil
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          ← Painel
        </Link>
      </div>

      {regularGuides.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Guias aplicáveis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {regularGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
          </div>
        </section>
      )}

      {alertGuides.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
            Situações que exigem atenção especial
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {alertGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
          </div>
        </section>
      )}

      {guides.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum guia aplicável encontrado.</p>
      )}
    </div>
  );
}
