import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { TaxProfile, ComplexityLevel } from "@/types/tax-profile";
import type { ChecklistItem } from "@/types/checklist";
import type { TaxAlert, AlertSeverity } from "@/types/alert";
import type { Guide } from "@/types/guide";
import { PDF_COLORS } from "@/lib/design/pdf-colors";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
 profile: TaxProfile;
 complexity: ComplexityLevel;
 checklist: ChecklistItem[];
 guides: Guide[];
 alerts: TaxAlert[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const COMPLEXITY_LABEL: Record<ComplexityLevel, string> = {
 simple: "Simples",
 medium: "Média",
 complex: "Complexa",
};

const COMPLEXITY_COLORS: Record<ComplexityLevel, { bg: string; text: string }> =
 {
 simple: { bg: PDF_COLORS.successBg, text: PDF_COLORS.successText },
 medium: { bg: PDF_COLORS.warningBg, text: PDF_COLORS.warningText },
 complex: { bg: PDF_COLORS.dangerBg, text: PDF_COLORS.dangerText },
 };

const ALERT_CONFIG: Record<
 AlertSeverity,
 { bg: string; border: string; sevColor: string; label: string }
> = {
 danger: {
 bg: PDF_COLORS.dangerBg,
 border: PDF_COLORS.dangerBorder,
 sevColor: PDF_COLORS.dangerText,
 label: "CRÍTICO",
 },
 warning: {
 bg: PDF_COLORS.warningBg,
 border: PDF_COLORS.warningBorder,
 sevColor: PDF_COLORS.warningText,
 label: "ATENÇÃO",
 },
 info: {
 bg: PDF_COLORS.infoBg,
 border: PDF_COLORS.infoBorder,
 sevColor: PDF_COLORS.infoText,
 label: "INFO",
 },
};

// ---------------------------------------------------------------------------
// Helper — collect applicable profile items
// ---------------------------------------------------------------------------
function getProfileItems(p: TaxProfile): string[] {
 return (
 [
 p.income.hasCltIncome && "Trabalho CLT",
 p.income.hasPensionOrRetirement && "Aposentadoria / INSS",
 p.income.hasSelfEmploymentIncome && "Renda autônoma",
 p.income.hasRentIncome && "Aluguel recebido",
 p.income.hasBusinessIncome && "Empresa / dividendos",
 p.assets.hasBankAccounts && "Contas bancárias",
 p.assets.hasInvestments && "Corretora",
 p.investments.soldVariableIncome && "Vendeu renda variável",
 p.investments.hasEtfs && "ETFs",
 p.assets.hasCrypto && "Criptoativos",
 p.assets.hasProperty && "Imóvel",
 p.assets.hasFinancedProperty && "Imóvel financiado",
 p.assets.hasVehicle && "Veículo",
 p.assets.hasForeignAssets && "Bens no exterior",
 p.deductions.hasDependents && "Dependentes",
 p.deductions.hasMedicalExpenses && "Despesas médicas",
 p.deductions.hasEducationExpenses && "Educação",
 p.deductions.hasPrivatePensionContributions && "Previdência privada",
 p.deductions.hasAlimony && "Pensão alimentícia",
 ] as (string | false)[]
 ).filter(Boolean) as string[];
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const S = StyleSheet.create({
 page: {
 fontFamily: "Helvetica",
 fontSize: 10,
 color: PDF_COLORS.foreground,
 paddingTop: 48,
 paddingBottom: 72,
 paddingHorizontal: 44,
 },
 // Header
 header: {
 marginBottom: 20,
 paddingBottom: 12,
 borderBottomWidth: 2,
 borderBottomColor: PDF_COLORS.primary,
 },
 appLabel: {
 fontSize: 8,
 color: PDF_COLORS.primary,
 fontFamily: "Helvetica-Bold",
 marginBottom: 4,
 },
 title: {
 fontSize: 18,
 fontFamily: "Helvetica-Bold",
 color: PDF_COLORS.foreground,
 },
 subtitle: { fontSize: 10, color: PDF_COLORS.muted, marginTop: 3 },
 // Complexity badge
 badge: {
 alignSelf: "flex-start",
 paddingHorizontal: 10,
 paddingVertical: 3,
 borderRadius: 4,
 marginBottom: 8,
 },
 badgeText: { fontSize: 9, fontFamily: "Helvetica-Bold" },
 complexWarn: {
 fontSize: 9.5,
 fontFamily: "Helvetica-Bold",
 color: PDF_COLORS.dangerText,
 marginBottom: 12,
 },
 // Section
 section: { marginBottom: 14 },
 sectionTitle: {
 fontSize: 11,
 fontFamily: "Helvetica-Bold",
 color: PDF_COLORS.foreground,
 paddingBottom: 5,
 marginBottom: 7,
 borderBottomWidth: 0.5,
 borderBottomColor: PDF_COLORS.border,
 },
 // Profile 2-col grid
 grid: { flexDirection: "row", flexWrap: "wrap" },
 gridCell: {
 width: "50%",
 fontSize: 9.5,
 color: PDF_COLORS.body,
 marginBottom: 3,
 paddingRight: 8,
 },
 // Checklist rows
 listRow: { flexDirection: "row", marginBottom: 4, alignItems: "flex-start" },
 listMark: { fontSize: 9, width: 26, flexShrink: 0, color: PDF_COLORS.faint },
 listText: { fontSize: 9.5, flex: 1, color: PDF_COLORS.body },
 listTextDone: {
 fontSize: 9.5,
 flex: 1,
 color: PDF_COLORS.faint,
 textDecoration: "line-through",
 },
 // Pending box
 pendingBox: {
 backgroundColor: PDF_COLORS.warningBg,
 borderRadius: 4,
 padding: 10,
 },
 pendingRow: {
 flexDirection: "row",
 marginBottom: 3,
 alignItems: "flex-start",
 },
 pendingBullet: {
 fontSize: 9.5,
 color: PDF_COLORS.warningText,
 width: 12,
 flexShrink: 0,
 },
 pendingText: { fontSize: 9.5, color: PDF_COLORS.warningText, flex: 1 },
 // Alert
 alertBox: {
 padding: 9,
 marginBottom: 7,
 borderRadius: 4,
 borderLeftWidth: 3,
 },
 alertSev: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 2 },
 alertTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", marginBottom: 2 },
 alertMsg: { fontSize: 9, color: PDF_COLORS.body },
 // Guides
 guideItem: { fontSize: 9.5, color: PDF_COLORS.body, marginBottom: 3 },
 // Next steps
 stepRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start" },
 stepNum: {
 fontSize: 9.5,
 fontFamily: "Helvetica-Bold",
 width: 16,
 flexShrink: 0,
 color: PDF_COLORS.primary,
 },
 stepText: { fontSize: 9.5, color: PDF_COLORS.body, flex: 1 },
 // Legal disclaimer
 disclaimer: {
 marginTop: 16,
 padding: 10,
 backgroundColor: PDF_COLORS.background,
 borderWidth: 0.5,
 borderColor: PDF_COLORS.border,
 borderRadius: 4,
 },
 disclaimerText: { fontSize: 8, color: PDF_COLORS.muted, lineHeight: 1.5 },
 // Fixed footer
 footer: {
 position: "absolute",
 bottom: 24,
 left: 44,
 right: 44,
 flexDirection: "row",
 justifyContent: "space-between",
 },
 footerText: { fontSize: 8, color: PDF_COLORS.faint },
});

// ---------------------------------------------------------------------------
// PDF document component
// ---------------------------------------------------------------------------
export default function ReportPDF({
 profile,
 complexity,
 checklist,
 guides,
 alerts,
}: Props) {
 const profileItems = getProfileItems(profile);
 const pending = checklist.filter((i) => i.required && !i.completed);
 const completedCount = checklist.filter((i) => i.completed).length;
 const badgeColors = COMPLEXITY_COLORS[complexity];

 const steps = [
 "Separe todos os documentos marcados no checklist.",
 "Leia os guias para cada situação do seu perfil.",
 "Confira os pontos de atenção antes de preencher.",
 ...(complexity === "medium"
 ? [
 "Sua declaração tem situações que merecem atenção extra — leia os guias com cuidado antes de preencher.",
 ]
 : complexity === "complex"
 ? [
 "Declaração complexa — considere revisão com contador ou especialista tributário antes do envio.",
 ]
 : []),
 ];

 return (
 <Document title={`Relatório IR ${profile.taxYear}`} author="IR Facilitador">
 <Page size="A4" style={S.page}>
 {/* ── Header ── */}
 <View style={S.header}>
 <Text style={S.appLabel}>IR FACILITADOR</Text>
 <Text style={S.title}>Relatório de Imposto de Renda</Text>
 <Text style={S.subtitle}>Ano-base: {profile.taxYear}</Text>
 </View>

 {/* ── Complexity badge ── */}
 <View style={{ ...S.badge, backgroundColor: badgeColors.bg }}>
 <Text style={{ ...S.badgeText, color: badgeColors.text }}>
 Complexidade: {COMPLEXITY_LABEL[complexity]}
 </Text>
 </View>
 {complexity === "complex" && (
 <Text style={S.complexWarn}>
 Declaração com pontos de maior risco. Recomendamos revisão com
 contador antes do envio.
 </Text>
 )}

 {/* ── Profile ── */}
 {profileItems.length > 0 && (
 <View style={S.section}>
 <Text style={S.sectionTitle}>Perfil identificado</Text>
 <View style={S.grid}>
 {profileItems.map((item) => (
 <Text key={item} style={S.gridCell}>
 • {item}
 </Text>
 ))}
 </View>
 </View>
 )}

 {/* ── Checklist ── */}
 {checklist.length > 0 && (
 <View style={S.section}>
 <Text style={S.sectionTitle}>
 Documentos ({completedCount}/{checklist.length} reunidos)
 </Text>
 {checklist.map((item) => (
 <View key={item.id} style={S.listRow}>
 <Text style={S.listMark}>
 {item.completed ? "[ok]" : "[ ]"}
 </Text>
 <Text style={item.completed ? S.listTextDone : S.listText}>
 {item.title}
 </Text>
 </View>
 ))}
 </View>
 )}

 {/* ── Pending ── */}
 {pending.length > 0 && (
 <View style={S.section}>
 <Text style={S.sectionTitle}>
 Pendências ({pending.length} documento
 {pending.length !== 1 ? "s" : ""})
 </Text>
 <View style={S.pendingBox}>
 {pending.map((item) => (
 <View key={item.id} style={S.pendingRow}>
 <Text style={S.pendingBullet}>• </Text>
 <Text style={S.pendingText}>{item.title}</Text>
 </View>
 ))}
 </View>
 </View>
 )}

 {/* ── Alerts ── */}
 {alerts.length > 0 && (
 <View style={S.section}>
 <Text style={S.sectionTitle}>Pontos de atenção</Text>
 {alerts.map((alert) => {
 const cfg = ALERT_CONFIG[alert.severity];
 return (
 <View
 key={alert.id}
 style={{
 ...S.alertBox,
 backgroundColor: cfg.bg,
 borderLeftColor: cfg.border,
 }}
 >
 <Text style={{ ...S.alertSev, color: cfg.sevColor }}>
 {cfg.label}
 </Text>
 <Text style={S.alertTitle}>{alert.title}</Text>
 <Text style={S.alertMsg}>{alert.message}</Text>
 </View>
 );
 })}
 </View>
 )}

 {/* ── Guides ── */}
 {guides.length > 0 && (
 <View style={S.section}>
 <Text style={S.sectionTitle}>Guias recomendados</Text>
 {guides.map((guide) => (
 <Text key={guide.slug} style={S.guideItem}>
 • {guide.title}
 </Text>
 ))}
 </View>
 )}

 {/* ── Next steps ── */}
 <View style={S.section}>
 <Text style={S.sectionTitle}>Próximos passos</Text>
 {steps.map((step, i) => (
 <View key={i} style={S.stepRow}>
 <Text style={S.stepNum}>{i + 1}.</Text>
 <Text style={S.stepText}>{step}</Text>
 </View>
 ))}
 </View>

 {/* ── Legal disclaimer ── */}
 <View style={S.disclaimer}>
 <Text style={S.disclaimerText}>
 AVISO LEGAL: Este relatório fornece orientação educacional e
 organizacional para facilitar o preenchimento da declaração. Ele não
 substitui contador, advogado, a Receita Federal ou orientação
 profissional. A responsabilidade final pelas informações declaradas
 é do contribuinte.
 </Text>
 </View>

 {/* ── Fixed footer ── */}
 <View style={S.footer} fixed>
 <Text style={S.footerText}>IR Facilitador</Text>
 <Text
 style={S.footerText}
 render={({ pageNumber, totalPages }) =>
 `Página ${pageNumber} de ${totalPages}`
 }
 />
 </View>
 </Page>
 </Document>
 );
}
