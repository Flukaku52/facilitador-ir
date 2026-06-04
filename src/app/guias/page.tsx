'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import { GUIDES } from '@/lib/data/guides';
import { Guide } from '@/types/guide';
import { loadTaxProfile } from '@/lib/storage/local-profile-storage';
import { getApplicableGuideSlugs } from '@/lib/rules/tax-rules';
import GuideCard from '@/components/guides/GuideCard';

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[] | null>(null);

  useEffect(() => {
    const profile = loadTaxProfile();
    if (profile) {
      const slugs = getApplicableGuideSlugs(profile);
      startTransition(() => setGuides(GUIDES.filter((g) => slugs.includes(g.slug))));
    } else {
      startTransition(() => setGuides(GUIDES));
    }
  }, []);

  if (guides === null) return null;

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
            {regularGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </section>
      )}

      {alertGuides.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-red-500 dark:text-red-400">
            Situações que exigem atenção especial
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {alertGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        </section>
      )}

      {guides.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum guia aplicável encontrado.</p>
      )}
    </div>
  );
}
