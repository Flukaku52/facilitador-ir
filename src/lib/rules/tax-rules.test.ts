import { describe, it, expect } from 'vitest';
import { createEmptyProfile } from '@/types/tax-profile';
import {
  classifyComplexity,
  generateChecklist,
  generateAlerts,
  calculateChecklistProgress,
  getApplicableGuideSlugs,
} from './tax-rules';

// ─── classifyComplexity ───────────────────────────────────────────────────────

describe('classifyComplexity', () => {
  it('retorna simple para perfil vazio', () => {
    const profile = createEmptyProfile();
    expect(classifyComplexity(profile)).toBe('simple');
  });

  it('retorna simple para CLT + banco', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    profile.assets.hasBankAccounts = true;
    expect(classifyComplexity(profile)).toBe('simple');
  });

  it('retorna medium para imóvel próprio', () => {
    const profile = createEmptyProfile();
    profile.assets.hasProperty = true;
    expect(classifyComplexity(profile)).toBe('medium');
  });

  it('retorna medium para dependentes', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasDependents = true;
    expect(classifyComplexity(profile)).toBe('medium');
  });

  it('retorna medium para previdência privada', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasPrivatePensionContributions = true;
    expect(classifyComplexity(profile)).toBe('medium');
  });

  it('retorna medium para renda fixa', () => {
    const profile = createEmptyProfile();
    profile.investments.hasFixedIncome = true;
    expect(classifyComplexity(profile)).toBe('medium');
  });

  it('retorna complex para venda de renda variável', () => {
    const profile = createEmptyProfile();
    profile.investments.soldVariableIncome = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('retorna complex para criptoativos', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('retorna complex para bens no exterior', () => {
    const profile = createEmptyProfile();
    profile.assets.hasForeignAssets = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('retorna complex para aluguel recebido', () => {
    const profile = createEmptyProfile();
    profile.income.hasRentIncome = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('retorna complex para autônomo', () => {
    const profile = createEmptyProfile();
    profile.income.hasSelfEmploymentIncome = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('retorna complex para pensão alimentícia', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasAlimony = true;
    expect(classifyComplexity(profile)).toBe('complex');
  });

  it('complex tem precedência sobre medium', () => {
    const profile = createEmptyProfile();
    profile.assets.hasProperty = true;        // medium
    profile.assets.hasCrypto = true;          // complex
    expect(classifyComplexity(profile)).toBe('complex');
  });
});

// ─── generateChecklist ────────────────────────────────────────────────────────

describe('generateChecklist', () => {
  it('retorna lista vazia para perfil vazio', () => {
    const profile = createEmptyProfile();
    expect(generateChecklist(profile)).toHaveLength(0);
  });

  it('inclui informe CLT quando hasCltIncome = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_clt_report')).toBe(true);
  });

  it('marca cl_clt_report como concluído se hasCltIncomeReport = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    profile.documents.hasCltIncomeReport = true;
    const items = generateChecklist(profile);
    const item = items.find((i) => i.id === 'cl_clt_report');
    expect(item?.completed).toBe(true);
  });

  it('inclui informe INSS quando hasPensionOrRetirement = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasPensionOrRetirement = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_inss_report')).toBe(true);
  });

  it('inclui informe bancário quando hasBankAccounts = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasBankAccounts = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_bank_report')).toBe(true);
  });

  it('inclui documentos do imóvel quando hasProperty = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasProperty = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_property_docs')).toBe(true);
  });

  it('inclui contrato de financiamento quando hasFinancedProperty = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasProperty = true;
    profile.assets.hasFinancedProperty = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_financing_docs')).toBe(true);
  });

  it('inclui notas de corretagem quando soldVariableIncome = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasInvestments = true;
    profile.investments.soldVariableIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_brokerage_notes')).toBe(true);
    expect(items.some((i) => i.id === 'cl_darf')).toBe(true);
  });

  it('inclui recibos médicos quando hasMedicalExpenses = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasMedicalExpenses = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_medical_receipts')).toBe(true);
  });

  it('marca recibos médicos como concluídos se hasMedicalReceipts = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasMedicalExpenses = true;
    profile.documents.hasMedicalReceipts = true;
    const items = generateChecklist(profile);
    const item = items.find((i) => i.id === 'cl_medical_receipts');
    expect(item?.completed).toBe(true);
  });

  it('inclui informe de educação quando hasEducationExpenses = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_education')).toBe(true);
    expect(items.find((i) => i.id === 'cl_education')?.required).toBe(true);
  });

  it('inclui documentos de dependentes quando hasDependents = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasDependents = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_dependents')).toBe(true);
    expect(items.find((i) => i.id === 'cl_dependents')?.required).toBe(true);
  });

  it('inclui decisão judicial quando hasAlimony = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasAlimony = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_alimony')).toBe(true);
    expect(items.find((i) => i.id === 'cl_alimony')?.required).toBe(true);
  });

  it('inclui renda autônoma quando hasSelfEmploymentIncome = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasSelfEmploymentIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_self_employment')).toBe(true);
  });

  it('inclui criptoativos no checklist quando hasCrypto = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_crypto')).toBe(true);
  });

  it('inclui bens no exterior quando hasForeignAssets = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasForeignAssets = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_foreign_docs')).toBe(true);
  });

  it('inclui informe de previdência quando hasPrivatePensionContributions = true', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasPrivatePensionContributions = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_pension_report')).toBe(true);
  });

  it('inclui informe do INSS quando hasPensionOrRetirement = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasPensionOrRetirement = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_inss_report')).toBe(true);
  });

  it('inclui outras rendas quando hasOtherIncome = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasOtherIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_other_income')).toBe(true);
  });

  it('inclui aluguel e carnê-leão quando hasRentIncome = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasRentIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_rent_income')).toBe(true);
    expect(items.some((i) => i.id === 'cl_carne_leao')).toBe(true);
  });

  it('inclui DARF e notas de corretagem quando soldVariableIncome = true', () => {
    const profile = createEmptyProfile();
    profile.investments.soldVariableIncome = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_brokerage_notes')).toBe(true);
    expect(items.some((i) => i.id === 'cl_darf')).toBe(true);
  });

  it('inclui informe de corretora quando hasInvestments = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasInvestments = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_broker_report')).toBe(true);
  });

  it('inclui documentos do veículo quando hasVehicle = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasVehicle = true;
    const items = generateChecklist(profile);
    expect(items.some((i) => i.id === 'cl_vehicle_docs')).toBe(true);
  });
});

// ─── generateAlerts ───────────────────────────────────────────────────────────

describe('generateAlerts', () => {
  it('retorna lista vazia para perfil limpo', () => {
    const profile = createEmptyProfile();
    expect(generateAlerts(profile)).toHaveLength(0);
  });

  it('gera alerta de despesas médicas sem recibo', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasMedicalExpenses = true;
    profile.documents.hasMedicalReceipts = false;
    const alerts = generateAlerts(profile);
    expect(alerts.some((a) => a.id === 'alert_medical_no_receipts')).toBe(true);
    expect(alerts.find((a) => a.id === 'alert_medical_no_receipts')?.severity).toBe('warning');
  });

  it('NÃO gera alerta médico quando recibos estão disponíveis', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasMedicalExpenses = true;
    profile.documents.hasMedicalReceipts = true;
    const alerts = generateAlerts(profile);
    expect(alerts.some((a) => a.id === 'alert_medical_no_receipts')).toBe(false);
  });

  it('gera alerta danger para venda de renda variável', () => {
    const profile = createEmptyProfile();
    profile.investments.soldVariableIncome = true;
    const alerts = generateAlerts(profile);
    expect(alerts.find((a) => a.id === 'alert_variable_income')?.severity).toBe('danger');
  });

  it('gera alerta danger para criptoativos', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    const alerts = generateAlerts(profile);
    expect(alerts.find((a) => a.id === 'alert_crypto')?.severity).toBe('danger');
  });

  it('gera alerta danger para bens no exterior', () => {
    const profile = createEmptyProfile();
    profile.assets.hasForeignAssets = true;
    const alerts = generateAlerts(profile);
    expect(alerts.find((a) => a.id === 'alert_foreign')?.severity).toBe('danger');
  });

  it('gera alerta warning para aluguel recebido', () => {
    const profile = createEmptyProfile();
    profile.income.hasRentIncome = true;
    const alerts = generateAlerts(profile);
    expect(alerts.find((a) => a.id === 'alert_rent')?.severity).toBe('warning');
  });

  it('gera alerta para imóvel financiado', () => {
    const profile = createEmptyProfile();
    profile.assets.hasFinancedProperty = true;
    const alerts = generateAlerts(profile);
    expect(alerts.some((a) => a.id === 'alert_financed_property')).toBe(true);
  });

  it('gera alerta warning para renda autônoma', () => {
    const profile = createEmptyProfile();
    profile.income.hasSelfEmploymentIncome = true;
    const alerts = generateAlerts(profile);
    expect(alerts.find((a) => a.id === 'alert_self_employment')?.severity).toBe('warning');
  });

  it('NÃO gera alerta de renda variável sem venda', () => {
    const profile = createEmptyProfile();
    profile.investments.hasStocks = true;
    const alerts = generateAlerts(profile);
    expect(alerts.some((a) => a.id === 'alert_variable_income')).toBe(false);
  });

  it('perfil complexo gera múltiplos alertas', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    profile.assets.hasForeignAssets = true;
    profile.investments.soldVariableIncome = true;
    const alerts = generateAlerts(profile);
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── calculateChecklistProgress ───────────────────────────────────────────────

describe('calculateChecklistProgress', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calculateChecklistProgress([])).toBe(0);
  });

  it('retorna 0 quando nenhum obrigatório está concluído', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    const items = generateChecklist(profile).map((i) => ({ ...i, completed: false }));
    expect(calculateChecklistProgress(items)).toBe(0);
  });

  it('retorna 100 quando todos os obrigatórios estão concluídos', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    const items = generateChecklist(profile).map((i) =>
      i.required ? { ...i, completed: true } : i,
    );
    expect(calculateChecklistProgress(items)).toBe(100);
  });

  it('ignora itens opcionais no cálculo', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasMedicalExpenses = true;
    const items = generateChecklist(profile);
    const optional = items.filter((i) => !i.required);
    expect(optional.length).toBeGreaterThan(0);
    const allRequiredDone = items.map((i) =>
      i.required ? { ...i, completed: true } : { ...i, completed: false },
    );
    expect(calculateChecklistProgress(allRequiredDone)).toBe(100);
  });
});

// ─── versionamento por ano-base ───────────────────────────────────────────────

describe('versionamento por taxYear', () => {
  it('classifyComplexity aceita taxYear sem alterar resultado baseado em flags', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    expect(classifyComplexity(profile, 2025)).toBe('complex');
    expect(classifyComplexity(profile, 2026)).toBe('complex');
  });

  it('generateChecklist - cl_education usa limite de dedução do ano 2025', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const items = generateChecklist(profile, 2025);
    const edu = items.find((i) => i.id === 'cl_education');
    expect(edu?.description).toContain('3.561,50');
    expect(edu?.description).toContain('2025');
  });

  it('generateChecklist - cl_education usa limite de dedução do ano 2026', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const items = generateChecklist(profile, 2026);
    const edu = items.find((i) => i.id === 'cl_education');
    expect(edu?.description).toContain('3.800,00');
    expect(edu?.description).toContain('2026');
  });

  it('generateChecklist - limites diferem entre 2025 e 2026', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const desc2025 = generateChecklist(profile, 2025).find((i) => i.id === 'cl_education')?.description;
    const desc2026 = generateChecklist(profile, 2026).find((i) => i.id === 'cl_education')?.description;
    expect(desc2025).not.toBe(desc2026);
  });

  it('generateAlerts - alerta de educação contém limite de 2025', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const alerts = generateAlerts(profile, 2025);
    const alert = alerts.find((a) => a.id === 'alert_education_limit');
    expect(alert).toBeDefined();
    expect(alert?.severity).toBe('info');
    expect(alert?.message).toContain('3.561,50');
  });

  it('generateAlerts - alerta de educação contém limite de 2026', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    const alerts = generateAlerts(profile, 2026);
    const alert = alerts.find((a) => a.id === 'alert_education_limit');
    expect(alert?.message).toContain('3.800,00');
  });

  it('getApplicableGuideSlugs aceita taxYear sem alterar slugs', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    const slugs2025 = getApplicableGuideSlugs(profile, 2025);
    const slugs2026 = getApplicableGuideSlugs(profile, 2026);
    expect(slugs2025).toEqual(slugs2026);
  });

  it('ano desconhecido usa fallback para thresholds mais recentes', () => {
    const profile = createEmptyProfile();
    profile.deductions.hasEducationExpenses = true;
    // Ano hipotético — não deve jogar erro, usa fallback
    expect(() => generateChecklist(profile, 9999)).not.toThrow();
    expect(() => generateAlerts(profile, 9999)).not.toThrow();
  });
});

// ─── getApplicableGuideSlugs ──────────────────────────────────────────────────

describe('getApplicableGuideSlugs', () => {
  it('retorna lista vazia para perfil vazio', () => {
    const profile = createEmptyProfile();
    expect(getApplicableGuideSlugs(profile)).toHaveLength(0);
  });

  it('inclui guia CLT quando hasCltIncome = true', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    expect(getApplicableGuideSlugs(profile)).toContain('clt-informe-rendimentos');
  });

  it('inclui guia de imóvel financiado quando hasFinancedProperty = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasFinancedProperty = true;
    expect(getApplicableGuideSlugs(profile)).toContain('imovel-financiado');
  });

  it('inclui guia de alerta de cripto quando hasCrypto = true', () => {
    const profile = createEmptyProfile();
    profile.assets.hasCrypto = true;
    expect(getApplicableGuideSlugs(profile)).toContain('cripto-alerta');
  });

  it('perfil completo retorna todos os guias', () => {
    const profile = createEmptyProfile();
    profile.income.hasCltIncome = true;
    profile.income.hasSelfEmploymentIncome = true;
    profile.income.hasRentIncome = true;
    profile.income.hasPensionOrRetirement = true;
    profile.assets.hasBankAccounts = true;
    profile.assets.hasInvestments = true;
    profile.assets.hasProperty = true;
    profile.assets.hasFinancedProperty = true;
    profile.assets.hasVehicle = true;
    profile.assets.hasCrypto = true;
    profile.assets.hasForeignAssets = true;
    profile.investments.hasFixedIncome = true;
    profile.investments.hasStocks = true;
    profile.investments.hasFiis = true;
    profile.investments.soldVariableIncome = true;
    profile.deductions.hasDependents = true;
    profile.deductions.hasMedicalExpenses = true;
    profile.deductions.hasEducationExpenses = true;
    profile.deductions.hasPrivatePensionContributions = true;
    const slugs = getApplicableGuideSlugs(profile);
    expect(slugs.length).toBe(17);
  });
});
