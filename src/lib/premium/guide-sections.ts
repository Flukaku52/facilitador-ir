import { getGuideBySlug } from "@/lib/data/guides";

// As 4 seções travadas de um guia — só entregues a usuário premium ativo.
// Mantidas fora do SSG/RSC: o conteúdo só sai pela API, nunca como prop de
// client component.
export interface PremiumGuideSections {
  documentsNeeded: string[];
  whereToDeclare: string;
  howToFill: string[];
  commonMistakes: string[];
}

// Extrai os campos travados do guia. null se o slug não existir.
// Função pura: não checa premium (isso é responsabilidade da rota).
export function getPremiumGuideSections(
  slug: string,
): PremiumGuideSections | null {
  const guide = getGuideBySlug(slug);
  if (!guide) return null;
  return {
    documentsNeeded: guide.documentsNeeded,
    whereToDeclare: guide.whereToDeclare,
    howToFill: guide.howToFill,
    commonMistakes: guide.commonMistakes,
  };
}
