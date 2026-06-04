import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GUIDES, getGuideBySlug } from '@/lib/data/guides';
import LegalDisclaimer from '@/components/layout/LegalDisclaimer';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guia não encontrado' };
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
        <Link href="/guias" className="text-sm text-indigo-600 hover:underline">
          ← Todos os guias
        </Link>
        <div className="mt-4 flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{guide.title}</h1>
          {guide.isAlert && (
            <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
              Requer atenção
            </span>
          )}
        </div>
        <p className="mt-2 text-gray-600">{guide.shortDescription}</p>
      </div>

      {/* Plain language explanation */}
      <section className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">
        <h2 className="font-semibold text-indigo-900 mb-2">O que isso significa, em resumo</h2>
        <p className="text-indigo-800 text-sm leading-relaxed">{guide.plainLanguageExplanation}</p>
      </section>

      {/* Documents needed */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">Documentos necessários</h2>
        <ul className="space-y-2">
          {guide.documentsNeeded.map((doc, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 text-indigo-400 shrink-0">•</span>
              {doc}
            </li>
          ))}
        </ul>
      </section>

      {/* Where to declare */}
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Onde declarar no programa</h2>
        <p className="text-sm text-gray-700">{guide.whereToDeclare}</p>
      </section>

      {/* How to fill */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">Como preencher</h2>
        <ol className="space-y-3">
          {guide.howToFill.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Common mistakes */}
      <section className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
        <h2 className="font-semibold text-yellow-900 mb-3">Erros comuns para evitar</h2>
        <ul className="space-y-2">
          {guide.commonMistakes.map((mistake, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
              <span className="mt-0.5 shrink-0 font-bold">!</span>
              {mistake}
            </li>
          ))}
        </ul>
      </section>

      {/* When to call accountant */}
      {guide.whenToCallAccountant && guide.whenToCallAccountant.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-900 mb-3">Quando chamar um contador</h2>
          <ul className="space-y-2">
            {guide.whenToCallAccountant.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-800">
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
