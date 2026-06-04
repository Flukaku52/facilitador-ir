import Link from 'next/link';
import { Guide } from '@/types/guide';
import { CATEGORY_LABELS } from '@/types/checklist';

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link
      href={`/guias/${guide.slug}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-600"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500 dark:text-indigo-400">
          {CATEGORY_LABELS[guide.category]}
        </span>
        {guide.isAlert && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
            Requer atenção
          </span>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">{guide.title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{guide.shortDescription}</p>
      <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
        Ver guia →
      </span>
    </Link>
  );
}
