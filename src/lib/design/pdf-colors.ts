// Paleta do PDF (@react-pdf/renderer não lê o CSS do app).
//
// Estes hex espelham os tokens semânticos de src/app/globals.css — etapa 2.
// Neutros: temperatura fria (slate). Acento: índigo institucional. Premium: ouro sóbrio.
// Estados (success/warning/danger/info): inalterados.
//
// ETAPA FUTURA: ao mudar a identidade visual, altere os tokens no globals.css
// E os valores aqui — são as duas únicas fontes de cor no projeto.
export const PDF_COLORS = {
  // marca / papéis (espelham primary-600, foreground, body, muted, border, background)
  primary: "#3B36A8", // ≈ primary-600 (índigo institucional — oklch 44% 0.185 278)
  foreground: "#0F1729", // ≈ foreground (slate-900 area — oklch 18% 0.03 262)
  body: "#384357", // ≈ body (slate-700 area — oklch 36% 0.03 258)
  muted: "#627589", // ≈ muted (slate-500 area — oklch 53% 0.033 257; WCAG AA ✓)
  faint: "#94A3B8", // slate-400 (decorativo: riscado, rodapé)
  border: "#E2E8F0", // ≈ border (slate-200 area — oklch 91% 0.011 254)
  background: "#FAFBFC", // ≈ background (near-white, leve temperatura fria)

  // estados (inalterados — success/warning/danger/info não mudaram na etapa 2)
  successBg: "#D1FAE5", // green-100
  successText: "#065F46", // green-800
  warningBg: "#FEF3C7", // yellow-100
  warningText: "#92400E", // yellow-800
  warningBorder: "#D97706", // yellow-600
  dangerBg: "#FEE2E2", // red-100
  dangerText: "#991B1B", // red-800
  dangerBorder: "#DC2626", // red-600
  infoBg: "#EFF6FF", // blue-50
  infoText: "#1E40AF", // blue-800
  infoBorder: "#3B82F6", // blue-500
} as const;
