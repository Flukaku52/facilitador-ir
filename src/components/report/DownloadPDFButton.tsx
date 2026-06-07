'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import ReportPDF from './ReportPDF';
import type { TaxProfile, ComplexityLevel } from '@/types/tax-profile';
import type { ChecklistItem } from '@/types/checklist';
import type { TaxAlert } from '@/types/alert';
import type { Guide } from '@/types/guide';

interface Props {
  profile: TaxProfile;
  complexity: ComplexityLevel;
  checklist: ChecklistItem[];
  guides: Guide[];
  alerts: TaxAlert[];
}

export default function DownloadPDFButton({ profile, complexity, checklist, guides, alerts }: Props) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    setGenerating(true);
    try {
      // pdf() renders the react-pdf document tree entirely client-side
      const blob = await pdf(
        <ReportPDF
          profile={profile}
          complexity={complexity}
          checklist={checklist}
          guides={guides}
          alerts={alerts}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-ir-${profile.taxYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Surfaces in the browser console; doesn't crash the page
      console.error('[DownloadPDFButton] falha ao gerar PDF:', err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-600"
    >
      {generating ? 'Gerando PDF...' : 'Baixar PDF'}
    </button>
  );
}
