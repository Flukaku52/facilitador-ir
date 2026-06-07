// IRPF 2026 — Declaração do exercício 2026, ano-calendário (renda) 2025
//
// Fonte: Receita Federal, Perguntas e Respostas IRPF 2026, versão 23/04/2026
//        IN RFB nº 2.312/2026 (quando aplicável)
//
// TAX_YEAR  = ano de exercício — ano em que a declaração é entregue (2026)
// BASE_YEAR = ano-calendário  — ano em que a renda foi auferida     (2025)

export const TAX_YEAR = 2026;
export const BASE_YEAR = 2025;

// Prazo confirmado: Receita Federal, Instrução Normativa de abertura do IRPF 2026
export const FILING_DEADLINE = new Date('2026-05-29T23:59:59-03:00');

// Valores confirmados — mesmos limites do IRPF 2025 (Congress não alterou para o exercício 2026)
// Fonte: Receita Federal, Perguntas e Respostas IRPF 2026, versão 23/04/2026
// TODO: versionar por ano-base se houver atualização legislativa futura
export const EDUCATION_DEDUCTION_LIMIT_PER_PERSON = 3561.50;
export const DEPENDENT_ANNUAL_DEDUCTION = 2275.08;
export const SIMPLIFIED_DEDUCTION_RATE = 0.20;
export const SIMPLIFIED_DEDUCTION_LIMIT = 16754.34;
