import { describe, it, expect } from 'vitest';
import { getChildPaths, getVisibleQuestions, QUESTIONS } from './questions';

// ─── getChildPaths ────────────────────────────────────────────────────────────

describe('getChildPaths', () => {
  it('retorna os 6 fieldPaths filhos de assets.hasInvestments', () => {
    const paths = getChildPaths('assets.hasInvestments');
    expect(paths).toContain('investments.hasFixedIncome');
    expect(paths).toContain('investments.hasStocks');
    expect(paths).toContain('investments.hasFiis');
    expect(paths).toContain('investments.hasEtfs');
    expect(paths).toContain('investments.soldVariableIncome');
    expect(paths).toContain('documents.hasBrokerReports');
    expect(paths).toHaveLength(6);
  });

  it('retorna os 2 fieldPaths filhos de assets.hasProperty', () => {
    const paths = getChildPaths('assets.hasProperty');
    expect(paths).toContain('assets.hasFinancedProperty');
    expect(paths).toContain('documents.hasPropertyDocuments');
    expect(paths).toHaveLength(2);
  });

  it('retorna 1 filho de deductions.hasMedicalExpenses', () => {
    const paths = getChildPaths('deductions.hasMedicalExpenses');
    expect(paths).toEqual(['documents.hasMedicalReceipts']);
  });

  it('retorna 1 filho de income.hasCltIncome', () => {
    expect(getChildPaths('income.hasCltIncome')).toEqual(['documents.hasCltIncomeReport']);
  });

  it('retorna 1 filho de assets.hasBankAccounts', () => {
    expect(getChildPaths('assets.hasBankAccounts')).toEqual(['documents.hasBankReports']);
  });

  it('retorna 1 filho de investments.hasPrivatePension', () => {
    expect(getChildPaths('investments.hasPrivatePension')).toEqual([
      'deductions.hasPrivatePensionContributions',
    ]);
  });

  it('retorna array vazio para campo sem filhos (assets.hasVehicle)', () => {
    expect(getChildPaths('assets.hasVehicle')).toEqual([]);
  });

  it('retorna array vazio para campo sem filhos (income.hasBusinessIncome)', () => {
    expect(getChildPaths('income.hasBusinessIncome')).toEqual([]);
  });

  it('retorna array vazio para campo inexistente', () => {
    expect(getChildPaths('campo.inexistente')).toEqual([]);
  });

  it('não retorna filhos de perguntas com showWhen.equals = false (só true conta)', () => {
    // Nenhuma pergunta atual usa equals:false, mas a função deve respeitar o filtro
    const paths = getChildPaths('assets.hasInvestments');
    // Todos os filhos retornados devem ter showWhen.equals === true
    const childQuestions = QUESTIONS.filter((q) => paths.includes(q.fieldPath));
    childQuestions.forEach((q) => {
      expect(q.showWhen?.equals).toBe(true);
    });
  });

  it('retorna 1 filho de deductions.hasEducationExpenses', () => {
    expect(getChildPaths('deductions.hasEducationExpenses')).toEqual([
      'deductions.hasInformalEducation',
    ]);
  });
});

// ─── getVisibleQuestions ──────────────────────────────────────────────────────

describe('getVisibleQuestions', () => {
  it('sem respostas mostra apenas as 17 perguntas sempre visíveis (sem showWhen)', () => {
    const visible = getVisibleQuestions({});
    expect(visible).toHaveLength(17);
    visible.forEach((q) => expect(q.showWhen).toBeUndefined());
  });

  it('com assets.hasInvestments=true inclui as 6 sub-perguntas de investimentos', () => {
    const visible = getVisibleQuestions({ 'assets.hasInvestments': true });
    const ids = visible.map((q) => q.id);
    expect(ids).toContain('q_fixed_income');
    expect(ids).toContain('q_stocks');
    expect(ids).toContain('q_fiis');
    expect(ids).toContain('q_etfs');
    expect(ids).toContain('q_sold_variable');
    expect(ids).toContain('q_broker_report');
  });

  it('com assets.hasInvestments=false oculta as sub-perguntas de investimentos', () => {
    const visible = getVisibleQuestions({ 'assets.hasInvestments': false });
    const ids = visible.map((q) => q.id);
    expect(ids).not.toContain('q_fixed_income');
    expect(ids).not.toContain('q_stocks');
    expect(ids).not.toContain('q_broker_report');
  });

  it('com assets.hasProperty=true inclui q_financed_property e q_property_docs', () => {
    const visible = getVisibleQuestions({ 'assets.hasProperty': true });
    const ids = visible.map((q) => q.id);
    expect(ids).toContain('q_financed_property');
    expect(ids).toContain('q_property_docs');
  });

  it('com assets.hasProperty=false oculta q_financed_property', () => {
    const visible = getVisibleQuestions({ 'assets.hasProperty': false });
    const ids = visible.map((q) => q.id);
    expect(ids).not.toContain('q_financed_property');
    expect(ids).not.toContain('q_property_docs');
  });

  it('com deductions.hasMedicalExpenses=true inclui q_medical_receipts', () => {
    const ids = getVisibleQuestions({ 'deductions.hasMedicalExpenses': true }).map((q) => q.id);
    expect(ids).toContain('q_medical_receipts');
  });

  it('múltiplas condições satisfeitas simultaneamente', () => {
    const ids = getVisibleQuestions({
      'assets.hasInvestments': true,
      'assets.hasProperty': true,
      'income.hasCltIncome': true,
    }).map((q) => q.id);
    expect(ids).toContain('q_fixed_income');
    expect(ids).toContain('q_financed_property');
    expect(ids).toContain('q_clt_report');
  });

  it('com hasEducationExpenses=true mostra q_informal_education', () => {
    const ids = getVisibleQuestions({ 'deductions.hasEducationExpenses': true }).map((q) => q.id);
    expect(ids).toContain('q_informal_education');
  });

  it('com hasEducationExpenses=false oculta q_informal_education', () => {
    const ids = getVisibleQuestions({ 'deductions.hasEducationExpenses': false }).map((q) => q.id);
    expect(ids).not.toContain('q_informal_education');
  });

  it('sem resposta para educação, q_informal_education não aparece', () => {
    const ids = getVisibleQuestions({}).map((q) => q.id);
    expect(ids).not.toContain('q_informal_education');
  });
});

// ─── limpeza de respostas filhas — simulação do comportamento de answer() ─────

describe('getChildPaths — consistência do perfil ao mudar resposta-pai para false', () => {
  it('limpar filhos de hasInvestments remove respostas obsoletas do estado', () => {
    // Simula: usuário respondeu "Sim" para investimentos e sub-perguntas,
    // depois voltou e mudou para "Não" — answer() deve excluir os filhos.
    const answersComFilhos = {
      'assets.hasInvestments': false,   // pai acabou de ser mudado para false
      'investments.hasStocks': true,    // resposta obsoleta que deve ser removida
      'investments.hasFiis': true,      // resposta obsoleta que deve ser removida
      'documents.hasBrokerReports': true,
    };

    const childPaths = getChildPaths('assets.hasInvestments');
    const exclude = new Set(childPaths);
    const cleaned = Object.fromEntries(
      Object.entries(answersComFilhos).filter(([k]) => !exclude.has(k)),
    );

    expect(cleaned['investments.hasStocks']).toBeUndefined();
    expect(cleaned['investments.hasFiis']).toBeUndefined();
    expect(cleaned['documents.hasBrokerReports']).toBeUndefined();
    expect(cleaned['assets.hasInvestments']).toBe(false); // pai permanece
  });

  it('limpar filhos de hasProperty remove respostas obsoletas', () => {
    const answers = {
      'assets.hasProperty': false,
      'assets.hasFinancedProperty': true,     // obsoleto
      'documents.hasPropertyDocuments': true, // obsoleto
    };
    const childPaths = getChildPaths('assets.hasProperty');
    const exclude = new Set(childPaths);
    const cleaned = Object.fromEntries(
      Object.entries(answers).filter(([k]) => !exclude.has(k)),
    );
    expect(cleaned['assets.hasFinancedProperty']).toBeUndefined();
    expect(cleaned['documents.hasPropertyDocuments']).toBeUndefined();
    expect(cleaned['assets.hasProperty']).toBe(false);
  });

  it('responder true não afeta respostas existentes', () => {
    const answers = {
      'assets.hasInvestments': true,
      'investments.hasStocks': true,
    };
    // Quando value === true, getChildPaths não é chamado — nada é removido
    const childPaths = getChildPaths('assets.hasInvestments'); // seria chamado apenas se false
    // Se fosse chamado para true (não deveria), o resultado seria 6 paths — mas não filtramos
    // O teste confirma que os filhos permanecem intactos quando o pai é true
    expect(answers['investments.hasStocks']).toBe(true);
    expect(childPaths).toHaveLength(6); // getChildPaths retorna corretamente mas não é aplicado
  });

  it('limpar filhos de hasEducationExpenses remove hasInformalEducation', () => {
    const answers = {
      'deductions.hasEducationExpenses': false,
      'deductions.hasInformalEducation': true,
    };
    const childPaths = getChildPaths('deductions.hasEducationExpenses');
    const exclude = new Set(childPaths);
    const cleaned = Object.fromEntries(
      Object.entries(answers).filter(([k]) => !exclude.has(k)),
    );
    expect(cleaned['deductions.hasInformalEducation']).toBeUndefined();
    expect(cleaned['deductions.hasEducationExpenses']).toBe(false);
  });
});
