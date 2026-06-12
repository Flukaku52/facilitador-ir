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
 className="block rounded-xl border border-border bg-surface p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:hover:border-primary-600"
 >
 <div className="flex items-start justify-between gap-2">
 <span className="text-xs font-semibold uppercase tracking-wide text-primary-500 dark:text-primary-400">
 {CATEGORY_LABELS[guide.category]}
 </span>
 {guide.isAlert && (
 <span className="rounded-full bg-danger-100 px-2 py-0.5 text-xs font-medium text-danger-700 dark:bg-danger-950 dark:text-danger-400">
 Requer atenção
 </span>
 )}
 </div>
 <h3 className="mt-2 text-base font-semibold text-foreground">{guide.title}</h3>
 <p className="mt-1 text-sm text-muted line-clamp-2">{guide.shortDescription}</p>
 <span className="mt-3 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
 Ver guia →
 </span>
 </Link>
 );
}
