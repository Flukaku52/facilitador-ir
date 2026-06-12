import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuideBySlug } from "@/lib/data/guides";
import LegalDisclaimer from "@/components/layout/LegalDisclaimer";
import GuideGatedSections from "@/components/guides/GuideGatedSections";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guia não encontrado" };
  return { title: `${guide.title} — IR Facilitador` };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <Link
          href="/guias"
          className="text-sm text-primary-600 hover:underline dark:text-primary-400"
        >
          ← Todos os guias
        </Link>
        <div className="mt-4 flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {guide.title}
          </h1>
          {guide.isAlert && (
            <span className="shrink-0 rounded-full bg-danger-100 px-3 py-1 text-sm font-medium text-danger-700 dark:bg-danger-950 dark:text-danger-400">
              Requer atenção
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {guide.shortDescription}
        </p>
      </div>

      <section className="rounded-xl bg-primary-50 border border-primary-100 p-5 dark:bg-primary-950 dark:border-primary-900">
        <h2 className="font-semibold text-primary-900 mb-2 dark:text-primary-100">
          O que isso significa, em resumo
        </h2>
        <p className="text-primary-800 text-sm leading-relaxed dark:text-primary-200">
          {guide.plainLanguageExplanation}
        </p>
      </section>

      <GuideGatedSections slug={guide.slug} />

      {guide.whenToCallAccountant && guide.whenToCallAccountant.length > 0 && (
        <section className="rounded-lg border border-danger-200 bg-danger-50 p-5 dark:border-danger-900 dark:bg-danger-950">
          <h2 className="font-semibold text-danger-900 mb-3 dark:text-danger-100">
            Quando chamar um contador
          </h2>
          <ul className="space-y-2">
            {guide.whenToCallAccountant.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-danger-800 dark:text-danger-200"
              >
                <span className="mt-0.5 shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      <LegalDisclaimer />
    </div>
  );
}
