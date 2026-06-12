// Paleta do PDF (@react-pdf/renderer não lê o CSS do app).
//
// Estes hex são os valores ATUAIS do relatório, preservados verbatim
// (etapa 1: PDF byte-idêntico). São equivalentes Tailwind v3 dos tokens
// semânticos definidos em src/app/globals.css — a web (v4) usa oklch
// perceptualmente próximo, dessincronia leve pré-existente e documentada.
//
// ETAPA 2 (redesign): ao mudar a identidade visual, altere os tokens no
// globals.css E os valores aqui — são as duas únicas fontes de cor.
export const PDF_COLORS = {
  // marca / papéis (espelham primary-600, foreground, body, muted, border, background)
  primary: "#4F46E5", // ≈ primary-600 (indigo-600 v3)
  foreground: "#111827", // ≈ foreground (gray-900 v3)
  body: "#374151", // ≈ body (gray-700 v3)
  muted: "#6B7280", // ≈ muted (gray-500 v3)
  faint: "#9CA3AF", // gray-400 v3 (decorativo: riscado, rodapé)
  border: "#E5E7EB", // ≈ border (gray-200 v3)
  background: "#F9FAFB", // ≈ background (gray-50 v3)

  // estados (espelham success / warning / danger / info)
  successBg: "#D1FAE5", // green-100 v3
  successText: "#065F46", // green-800 v3
  warningBg: "#FEF3C7", // amber-100 v3
  warningText: "#92400E", // amber-800 v3
  warningBorder: "#D97706", // amber-600 v3
  dangerBg: "#FEE2E2", // red-100 v3
  dangerText: "#991B1B", // red-800 v3
  dangerBorder: "#DC2626", // red-600 v3
  infoBg: "#EFF6FF", // blue-50 v3
  infoText: "#1E40AF", // blue-800 v3
  infoBorder: "#3B82F6", // blue-500 v3
} as const;
