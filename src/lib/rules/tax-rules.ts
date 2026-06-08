import { TaxProfile, ComplexityLevel } from '@/types/tax-profile';
import { ChecklistItem } from '@/types/checklist';
import { TaxAlert } from '@/types/alert';
import { GUIDES } from '@/lib/data/guides';
import { getTaxYearThresholds, getCurrentTaxYear } from '@/lib/tax-years';

function formatBRL(value: number): string {
  return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function classifyComplexity(
  profile: TaxProfile,
  taxYear: number = getCurrentTaxYear(),
): ComplexityLevel {
  // thresholds available for future income-based classification rules
  void getTaxYearThresholds(taxYear);
  const { income, assets, investments, deductions } = profile;

  const isComplex =
    investments.soldVariableIncome ||
    assets.hasCrypto ||
    assets.hasForeignAssets ||
    income.hasRentIncome ||
    income.hasSelfEmploymentIncome ||
    deductions.hasAlimony ||
    income.hasBusinessIncome;

  if (isComplex) return 'complex';

  const isMedium =
    assets.hasProperty ||
    assets.hasFinancedProperty ||
    assets.hasVehicle ||
    deductions.hasDependents ||
    deductions.hasPrivatePensionContributions ||
    investments.hasStocks ||
    investments.hasFiis ||
    investments.hasEtfs ||
    investments.hasFixedIncome ||
    income.hasPensionOrRetirement;

  if (isMedium) return 'medium';

  return 'simple';
}

export function generateChecklist(
  profile: TaxProfile,
  taxYear: number = getCurrentTaxYear(),
): ChecklistItem[] {
  const thresholds = getTaxYearThresholds(taxYear);
  const items: ChecklistItem[] = [];
  const { income, assets, investments, deductions, documents } = profile;

  // ─── RENDA ───────────────────────────────────────────────────────────────
  if (income.hasCltIncome) {
    items.push({
      id: 'cl_clt_report',
      title: 'Informe de rendimentos da empresa (empregador)',
      description: 'Peça no RH ou acesse o portal do funcionário.',
      category: 'income',
      required: true,
      completed: documents.hasCltIncomeReport,
      relatedGuideSlug: 'clt-informe-rendimentos',
    });
  }

  if (income.hasPensionOrRetirement) {
    items.push({
      id: 'cl_inss_report',
      title: 'Informe de rendimentos do INSS',
      description: 'Disponível no Meu INSS (meu.inss.gov.br) ou pelo 135.',
      category: 'income',
      required: true,
      completed: false,
      relatedGuideSlug: 'aposentadoria-pensao',
    });
  }

  if (income.hasSelfEmploymentIncome) {
    items.push({
      id: 'cl_self_employment',
      title: 'Recibos de serviços prestados e informes das empresas contratantes',
      description: 'Reúna todos os comprovantes de renda autônoma do ano.',
      category: 'income',
      required: true,
      completed: false,
      relatedGuideSlug: 'autonomo-freelancer-alerta',
    });
  }

  if (income.hasRentIncome) {
    items.push({
      id: 'cl_rent_income',
      title: 'Recibos de aluguel recebidos e contrato de locação',
      category: 'income',
      required: true,
      completed: false,
      relatedGuideSlug: 'aluguel-recebido-alerta',
    });
    items.push({
      id: 'cl_carne_leao',
      title: 'Comprovantes de pagamento do carnê-leão (se aplicável)',
      description: 'Aluguel pago por pessoa física exige carnê-leão mensal.',
      category: 'income',
      required: true,
      completed: false,
      relatedGuideSlug: 'aluguel-recebido-alerta',
    });
  }

  if (income.hasOtherIncome) {
    items.push({
      id: 'cl_other_income',
      title: 'Comprovantes de outras rendas recebidas no ano',
      description: 'Prêmios, heranças, doações, rendas eventuais.',
      category: 'income',
      required: true,
      completed: false,
    });
  }

  // ─── BANCOS ───────────────────────────────────────────────────────────────
  if (assets.hasBankAccounts) {
    items.push({
      id: 'cl_bank_report',
      title: 'Informe de rendimentos de cada banco',
      description: 'Disponível no app, internet banking ou agência.',
      category: 'bank',
      required: true,
      completed: documents.hasBankReports,
      relatedGuideSlug: 'contas-bancarias',
    });
  }

  // ─── BENS ─────────────────────────────────────────────────────────────────
  if (assets.hasProperty) {
    items.push({
      id: 'cl_property_docs',
      title: 'Escritura, contrato de compra e venda ou documentos do imóvel',
      description: 'Necessário para informar a descrição e o custo de aquisição.',
      category: 'assets',
      required: true,
      completed: documents.hasPropertyDocuments,
      relatedGuideSlug: assets.hasFinancedProperty ? 'imovel-financiado' : 'imovel-proprio',
    });
  }

  if (assets.hasFinancedProperty) {
    items.push({
      id: 'cl_financing_docs',
      title: 'Contrato de financiamento e comprovantes de parcelas pagas no ano',
      description: 'Para declarar o valor efetivamente pago até 31/12.',
      category: 'assets',
      required: true,
      completed: false,
      relatedGuideSlug: 'imovel-financiado',
    });
  }

  if (assets.hasVehicle) {
    items.push({
      id: 'cl_vehicle_docs',
      title: 'Documento do veículo (CRLV) ou nota fiscal de aquisição',
      category: 'assets',
      required: true,
      completed: false,
      relatedGuideSlug: 'veiculo',
    });
  }

  if (assets.hasForeignAssets) {
    items.push({
      id: 'cl_foreign_docs',
      title: 'Extrato de contas e posição de investimentos no exterior em 31/12',
      category: 'assets',
      required: true,
      completed: false,
      relatedGuideSlug: 'exterior-alerta',
    });
  }

  // ─── INVESTIMENTOS ────────────────────────────────────────────────────────
  if (assets.hasInvestments) {
    items.push({
      id: 'cl_broker_report',
      title: 'Informe de rendimentos da corretora',
      description: 'Disponível na área logada da corretora, geralmente em fevereiro.',
      category: 'investments',
      required: true,
      completed: documents.hasBrokerReports,
      relatedGuideSlug: 'corretora-investimentos',
    });
  }

  if (investments.soldVariableIncome) {
    items.push({
      id: 'cl_brokerage_notes',
      title: 'Notas de corretagem de todas as compras e vendas do ano',
      description: 'Necessário para apurar ganho ou prejuízo em renda variável.',
      category: 'investments',
      required: true,
      completed: false,
      relatedGuideSlug: 'acoes-fiis-alerta',
    });
    items.push({
      id: 'cl_darf',
      title: 'DARFs de renda variável pagos ao longo do ano',
      description: 'Guarde todos os comprovantes de DARF pago.',
      category: 'investments',
      required: true,
      completed: false,
      relatedGuideSlug: 'acoes-fiis-alerta',
    });
  }

  if (assets.hasCrypto) {
    items.push({
      id: 'cl_crypto',
      title: 'Posição de criptoativos em 31/12 e histórico de transações',
      description: 'Extrato de cada exchange ou carteira utilizada.',
      category: 'investments',
      required: true,
      completed: false,
      relatedGuideSlug: 'cripto-alerta',
    });
  }

  if (deductions.hasPrivatePensionContributions) {
    items.push({
      id: 'cl_pension_report',
      title: 'Informe de contribuições e saldo da previdência privada',
      description: 'PGBL ou VGBL — a seguradora ou banco emite esse documento.',
      category: 'investments',
      required: true,
      completed: false,
      relatedGuideSlug: 'previdencia-privada',
    });
  }

  // ─── DEDUÇÕES ─────────────────────────────────────────────────────────────
  if (deductions.hasMedicalExpenses) {
    items.push({
      id: 'cl_medical_receipts',
      title: 'Recibos e notas fiscais de despesas médicas',
      description: 'Médico, dentista, psicólogo, fisioterapeuta, hospital.',
      category: 'deductions',
      required: true,
      completed: documents.hasMedicalReceipts,
      relatedGuideSlug: 'despesas-medicas',
    });
    items.push({
      id: 'cl_health_plan',
      title: 'Informe de pagamentos do plano de saúde',
      description: 'A operadora envia esse informe anualmente.',
      category: 'deductions',
      required: false,
      completed: false,
      relatedGuideSlug: 'despesas-medicas',
    });
  }

  if (deductions.hasEducationExpenses) {
    items.push({
      id: 'cl_education',
      title: 'Informe de pagamentos da instituição de ensino',
      description: `Escola, faculdade ou curso técnico. Limite de dedução por pessoa em ${taxYear}: R$ ${formatBRL(thresholds.EDUCATION_DEDUCTION_LIMIT_PER_PERSON)}.`,
      category: 'deductions',
      required: true,
      completed: false,
      relatedGuideSlug: 'despesas-educacao',
    });
  }

  if (deductions.hasDependents) {
    items.push({
      id: 'cl_dependents',
      title: 'CPF e documentos dos dependentes',
      description: 'Obrigatório para todos os dependentes, inclusive crianças.',
      category: 'deductions',
      required: true,
      completed: false,
      relatedGuideSlug: 'dependentes',
    });
  }

  if (deductions.hasAlimony) {
    items.push({
      id: 'cl_alimony',
      title: 'Decisão judicial e comprovantes de pensão alimentícia paga',
      category: 'deductions',
      required: true,
      completed: false,
    });
  }

  return items;
}

export function getApplicableGuideSlugs(
  profile: TaxProfile,
  taxYear: number = getCurrentTaxYear(),
): string[] {
  // taxYear reserved for future guide filtering by year
  void taxYear;
  const slugs: string[] = [];

  for (const guide of GUIDES) {
    const applies = guide.appliesTo.some((path) => {
      const value = getNestedValue(profile, path);
      return value === true;
    });
    if (applies) slugs.push(guide.slug);
  }

  return slugs;
}

export function generateAlerts(
  profile: TaxProfile,
  taxYear: number = getCurrentTaxYear(),
): TaxAlert[] {
  const thresholds = getTaxYearThresholds(taxYear);
  const alerts: TaxAlert[] = [];
  const { income, assets, investments, deductions, documents } = profile;

  if (deductions.hasMedicalExpenses && !documents.hasMedicalReceipts) {
    alerts.push({
      id: 'alert_medical_no_receipts',
      severity: 'warning',
      title: 'Despesas médicas sem comprovantes',
      message:
        'Você informou despesas médicas, mas não tem recibos ou comprovantes. Despesas médicas sem comprovação são um dos principais motivos de malha fina. Reúna todos os documentos antes de declarar.',
      relatedGuideSlug: 'despesas-medicas',
    });
  }

  if (assets.hasFinancedProperty) {
    alerts.push({
      id: 'alert_financed_property',
      severity: 'info',
      title: 'Atenção ao valor do imóvel financiado',
      message:
        'Em imóvel financiado, declare apenas o valor efetivamente pago até 31/12 — entrada, parcelas e custos de cartório. Não declare o valor total do imóvel.',
      relatedGuideSlug: 'imovel-financiado',
    });
  }

  if (investments.soldVariableIncome) {
    alerts.push({
      id: 'alert_variable_income',
      severity: 'danger',
      title: 'Venda de renda variável exige atenção especial',
      message:
        'Você vendeu ações, FIIs, ETFs ou outros ativos. Esse caso exige apuração mês a mês de ganho e prejuízo, possível pagamento de DARF e controle de compensação de perdas. Recomendamos revisão com contador.',
      relatedGuideSlug: 'acoes-fiis-alerta',
    });
  }

  if (assets.hasCrypto) {
    alerts.push({
      id: 'alert_crypto',
      severity: 'danger',
      title: 'Criptoativos exigem cuidado',
      message:
        'Criptoativos têm regras específicas de declaração. Vendas e permutas podem gerar ganho de capital tributável. A Receita Federal já recebe dados das exchanges brasileiras. Recomendamos revisão profissional.',
      relatedGuideSlug: 'cripto-alerta',
    });
  }

  if (income.hasRentIncome) {
    alerts.push({
      id: 'alert_rent',
      severity: 'warning',
      title: 'Aluguel recebido pode exigir carnê-leão',
      message:
        'Aluguel recebido de pessoa física exige carnê-leão mensal, pago ao longo do ano. Se não foi pago, há multa e juros. Verifique sua situação antes de declarar.',
      relatedGuideSlug: 'aluguel-recebido-alerta',
    });
  }

  if (assets.hasForeignAssets) {
    alerts.push({
      id: 'alert_foreign',
      severity: 'danger',
      title: 'Bens no exterior aumentam a complexidade',
      message:
        'Bens, contas ou investimentos no exterior têm obrigações específicas, incluindo eventual declaração ao Banco Central (CBE). Recomendamos validação com contador.',
      relatedGuideSlug: 'exterior-alerta',
    });
  }

  if (income.hasSelfEmploymentIncome) {
    alerts.push({
      id: 'alert_self_employment',
      severity: 'warning',
      title: 'Renda autônoma pode exigir carnê-leão',
      message:
        'Renda recebida de pessoas físicas como autônomo ou freelancer exige carnê-leão mensal. Verifique se todos os meses foram pagos corretamente.',
      relatedGuideSlug: 'autonomo-freelancer-alerta',
    });
  }

  if (deductions.hasEducationExpenses) {
    if (deductions.hasInformalEducation) {
      alerts.push({
        id: 'alert_education_informal',
        severity: 'warning',
        title: 'Despesas de educação podem incluir gastos não dedutíveis',
        message: `Você informou despesas com educação que podem incluir curso livre, idioma, cursinho ou aula particular. Nem todo gasto educacional é dedutível. Separe apenas despesas de ensino formal antes de declarar. O limite de dedução com educação por pessoa para ${taxYear} é R$ ${formatBRL(thresholds.EDUCATION_DEDUCTION_LIMIT_PER_PERSON)}.`,
        relatedGuideSlug: 'despesas-educacao',
      });
    } else {
      alerts.push({
        id: 'alert_education_limit',
        severity: 'info',
        title: 'Atenção ao limite de dedução com educação',
        message: `O limite de dedução com educação por pessoa para ${taxYear} é R$ ${formatBRL(thresholds.EDUCATION_DEDUCTION_LIMIT_PER_PERSON)}. Apenas ensino formal é dedutível — cursos livres e idiomas geralmente não são.`,
        relatedGuideSlug: 'despesas-educacao',
      });
    }
  }

  return alerts;
}

export function calculateChecklistProgress(items: ChecklistItem[]): number {
  const required = items.filter((i) => i.required);
  if (required.length === 0) return 0;
  const done = required.filter((i) => i.completed);
  return Math.round((done.length / required.length) * 100);
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
