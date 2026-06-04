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
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
          {CATEGORY_LABELS[guide.category]}
        </span>
        {guide.isAlert && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Requer atenção
          </span>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold text-gray-900">{guide.title}</h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{guide.shortDescription}</p>
      <span className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
        Ver guia →
      </span>
    </Link>
  );
}
