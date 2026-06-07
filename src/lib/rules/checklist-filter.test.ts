import { describe, it, expect } from 'vitest';
import { ChecklistItem } from '@/types/checklist';
import { applyChecklistFilters, getAvailableCategories } from './checklist-filter';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const ITEMS: ChecklistItem[] = [
  {
    id: 'i1',
    title: 'Informe de rendimentos da empresa',
    description: 'Peça no RH ou portal do funcionário.',
    category: 'income',
    required: true,
    completed: true,
  },
  {
    id: 'i2',
    title: 'Informe de rendimentos do banco',
    description: 'Disponível no internet banking.',
    category: 'bank',
    required: true,
    completed: false,
  },
  {
    id: 'i3',
    title: 'Recibos de despesas médicas',
    description: 'Médico, dentista, fisioterapeuta.',
    category: 'deductions',
    required: true,
    completed: false,
  },
  {
    id: 'i4',
    title: 'Informe da previdência privada',
    description: undefined,
    category: 'investments',
    required: true,
    completed: false,
  },
  {
    id: 'i5',
    title: 'Informe de pagamentos de educação',
    description: 'Escola ou faculdade — limite de dedução.',
    category: 'deductions',
    required: true,
    completed: false,
  },
];

// Helper: base filters with all neutralized
const base = (overrides: Partial<Parameters<typeof applyChecklistFilters>[1]>) =>
  applyChecklistFilters(ITEMS, { status: 'all', category: 'all', query: '', ...overrides });

// ─── 1. Filtro status: pending ────────────────────────────────────────────────

describe('applyChecklistFilters — status filter', () => {
  it('1. pending retorna apenas itens com completed=false', () => {
    const result = base({ status: 'pending' });
    expect(result.every((i) => !i.completed)).toBe(true);
    expect(result.map((i) => i.id)).toEqual(['i2', 'i3', 'i4', 'i5']);
  });

  it('2. done retorna apenas itens com completed=true', () => {
    const result = base({ status: 'done' });
    expect(result.every((i) => i.completed)).toBe(true);
    expect(result.map((i) => i.id)).toEqual(['i1']);
  });

  it('all retorna todos os itens sem filtro de status', () => {
    const result = base({ status: 'all' });
    expect(result).toHaveLength(ITEMS.length);
  });
});

// ─── 2. Filtro por categoria ──────────────────────────────────────────────────

describe('applyChecklistFilters — category filter', () => {
  it('3. category income retorna apenas itens de renda', () => {
    const result = base({ category: 'income' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i1');
    expect(result.every((i) => i.category === 'income')).toBe(true);
  });

  it('category deductions retorna os dois itens de deduções', () => {
    const result = base({ category: 'deductions' });
    expect(result.map((i) => i.id)).toEqual(['i3', 'i5']);
  });

  it('category all não filtra por categoria', () => {
    const result = base({ category: 'all' });
    expect(result).toHaveLength(ITEMS.length);
  });
});

// ─── 3. Busca por texto ───────────────────────────────────────────────────────

describe('applyChecklistFilters — query filter', () => {
  it('4. busca por title encontra itens corretamente', () => {
    const result = base({ query: 'banco' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i2');
  });

  it('5. busca por description encontra itens cujo título não contém o termo', () => {
    // "internet" está na description de i2, não no title
    const result = base({ query: 'internet' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i2');
  });

  it('6. busca vazia retorna todos os itens', () => {
    const result = base({ query: '' });
    expect(result).toHaveLength(ITEMS.length);
  });

  it('7. busca é case-insensitive (INFORME = informe)', () => {
    const result = base({ query: 'INFORME' });
    // i1, i2, i4, i5 têm "informe" no título; i3 não tem
    expect(result.map((i) => i.id)).toEqual(['i1', 'i2', 'i4', 'i5']);
  });

  it('8a. busca ignora acentos: "medicas" encontra "médicas"', () => {
    const result = base({ query: 'medicas' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i3');
  });

  it('8b. busca ignora acentos: "educacao" encontra "educação"', () => {
    const result = base({ query: 'educacao' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i5');
  });

  it('8c. busca ignora acentos em description: "fisioterapeuta" sem acento encontra com acento', () => {
    // "fisioterapeuta" não tem acento, mas o teste valida que a normalização
    // não quebra strings sem diacríticos
    const result = base({ query: 'fisioterapeuta' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i3');
  });

  it('busca com espaços é trimada antes de aplicar', () => {
    const result = base({ query: '  banco  ' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i2');
  });
});

// ─── 4. Combinações ───────────────────────────────────────────────────────────

describe('applyChecklistFilters — combinações', () => {
  it('9. status pending + category deductions retorna interseção correta', () => {
    const result = applyChecklistFilters(ITEMS, {
      status: 'pending',
      category: 'deductions',
      query: '',
    });
    // i3 e i5 são deductions e completed=false
    expect(result.map((i) => i.id)).toEqual(['i3', 'i5']);
  });

  it('10. busca + status done: retorna apenas itens concluídos que passam na busca', () => {
    const result = applyChecklistFilters(ITEMS, {
      status: 'done',
      category: 'all',
      query: 'informe',
    });
    // Apenas i1 é completed=true e contém "informe" no título
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i1');
  });

  it('busca + category + status: tripla combinação', () => {
    const result = applyChecklistFilters(ITEMS, {
      status: 'pending',
      category: 'deductions',
      query: 'educacao',
    });
    // pending + deductions + "educação" → apenas i5
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('i5');
  });

  it('filtros que não correspondem a nenhum item retornam array vazio', () => {
    const result = applyChecklistFilters(ITEMS, {
      status: 'done',
      category: 'investments',
      query: '',
    });
    // i4 é investments mas completed=false
    expect(result).toHaveLength(0);
  });
});

// ─── 5. getAvailableCategories ────────────────────────────────────────────────

describe('getAvailableCategories', () => {
  it('11. não inclui categorias sem itens', () => {
    const cats = getAvailableCategories(ITEMS);
    expect(cats).not.toContain('assets');
    expect(cats).not.toContain('complex_cases');
    expect(cats).not.toContain('other');
  });

  it('inclui apenas as categorias presentes em items', () => {
    const cats = getAvailableCategories(ITEMS);
    expect(cats).toContain('income');
    expect(cats).toContain('bank');
    expect(cats).toContain('deductions');
    expect(cats).toContain('investments');
  });

  it('retorna categorias na ordem de CHECKLIST_CATEGORY_ORDER', () => {
    const cats = getAvailableCategories(ITEMS);
    // income < bank < investments < deductions na ordem definida
    expect(cats.indexOf('income')).toBeLessThan(cats.indexOf('bank'));
    expect(cats.indexOf('bank')).toBeLessThan(cats.indexOf('investments'));
    expect(cats.indexOf('investments')).toBeLessThan(cats.indexOf('deductions'));
  });

  it('retorna array vazio para lista de itens vazia', () => {
    expect(getAvailableCategories([])).toEqual([]);
  });
});

// ─── 6. Contadores (lógica do indicador "Exibindo X de Y") ───────────────────

describe('indicador Exibindo X de Y', () => {
  it('12. filteredItems.length com pending = 4; allItems.length = 5', () => {
    const filtered = base({ status: 'pending' });
    expect(filtered.length).toBe(4);
    expect(ITEMS.length).toBe(5);
    // → "Exibindo 4 de 5 itens"
  });

  // Regressão: pendingCount deve contar todos os !completed, incluindo opcionais.
  // Bug anterior: pendingCount = required && !completed → excluía opcionais,
  // divergindo do filtro que mostra todos os !completed.
  it('pending inclui itens opcionais (required=false) não concluídos', () => {
    const itemsComOpcional: ChecklistItem[] = [
      ...ITEMS,
      {
        id: 'i_opt',
        title: 'Informe opcional de plano de saúde',
        category: 'deductions',
        required: false,   // ← opcional
        completed: false,  // ← não concluído → deve entrar no pending
      },
    ];
    const filtered = applyChecklistFilters(itemsComOpcional, {
      status: 'pending',
      category: 'all',
      query: '',
    });
    const ids = filtered.map((i) => i.id);
    expect(ids).toContain('i_opt');
    // contador da pill deve ser filtered.length, não required-only count
    expect(filtered.length).toBe(5); // 4 obrigatórios + 1 opcional
  });

  it('filteredItems.length com category=investments = 1; total = 5', () => {
    const filtered = base({ category: 'investments' });
    expect(filtered.length).toBe(1);
    expect(ITEMS.length).toBe(5);
    // → "Exibindo 1 de 5 itens"
  });

  it('sem filtro ativo: filteredItems.length === allItems.length', () => {
    const filtered = base({});
    expect(filtered.length).toBe(ITEMS.length);
    // → indicador não deve ser exibido
  });
});
