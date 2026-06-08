export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export interface TaxProfile {
  id: string;
  taxYear: number;

  income: {
    hasCltIncome: boolean;
    hasBusinessIncome: boolean;
    hasSelfEmploymentIncome: boolean;
    hasRentIncome: boolean;
    hasPensionOrRetirement: boolean;
    hasOtherIncome: boolean;
  };

  assets: {
    hasBankAccounts: boolean;
    hasInvestments: boolean;
    hasProperty: boolean;
    hasFinancedProperty: boolean;
    hasVehicle: boolean;
    hasCrypto: boolean;
    hasForeignAssets: boolean;
  };

  investments: {
    hasFixedIncome: boolean;
    hasStocks: boolean;
    hasFiis: boolean;
    hasEtfs: boolean;
    hasPrivatePension: boolean;
    soldVariableIncome: boolean;
  };

  deductions: {
    hasDependents: boolean;
    hasMedicalExpenses: boolean;
    hasEducationExpenses: boolean;
    hasInformalEducation: boolean;
    hasPrivatePensionContributions: boolean;
    hasAlimony: boolean;
  };

  documents: {
    hasCltIncomeReport: boolean;
    hasBankReports: boolean;
    hasBrokerReports: boolean;
    hasMedicalReceipts: boolean;
    hasPropertyDocuments: boolean;
  };

  complexity?: ComplexityLevel;
  createdAt: string;
  updatedAt: string;
}

export function createEmptyProfile(): TaxProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    taxYear: new Date().getFullYear() - 1,
    income: {
      hasCltIncome: false,
      hasBusinessIncome: false,
      hasSelfEmploymentIncome: false,
      hasRentIncome: false,
      hasPensionOrRetirement: false,
      hasOtherIncome: false,
    },
    assets: {
      hasBankAccounts: false,
      hasInvestments: false,
      hasProperty: false,
      hasFinancedProperty: false,
      hasVehicle: false,
      hasCrypto: false,
      hasForeignAssets: false,
    },
    investments: {
      hasFixedIncome: false,
      hasStocks: false,
      hasFiis: false,
      hasEtfs: false,
      hasPrivatePension: false,
      soldVariableIncome: false,
    },
    deductions: {
      hasDependents: false,
      hasMedicalExpenses: false,
      hasEducationExpenses: false,
      hasInformalEducation: false,
      hasPrivatePensionContributions: false,
      hasAlimony: false,
    },
    documents: {
      hasCltIncomeReport: false,
      hasBankReports: false,
      hasBrokerReports: false,
      hasMedicalReceipts: false,
      hasPropertyDocuments: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}
