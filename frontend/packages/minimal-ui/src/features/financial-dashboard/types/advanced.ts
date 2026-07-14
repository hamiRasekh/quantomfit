export type FinancialNonOperatingType = 'interest' | 'fine' | 'asset_loss' | 'other';

export interface FinancialAssetDepreciation {
  id: string;
  assetName: string;
  monthlyAmount: number;
  bookValue: number;
  startDate: string;
}

export interface FinancialNonOperatingEntry {
  id: string;
  type: FinancialNonOperatingType;
  amount: number;
  entryDate: string;
  note?: string;
}

export interface FinancialExecutiveSummary {
  weeklyRevenue: {
    concrete: number;
    transport: number;
    pumping: number;
    total: number;
  };
  grossProfit: {
    revenue: number;
    cogs: number;
    amount: number;
    marginPercent: number;
  };
  liquidity: {
    cashInMonth: number;
    bankBalance: number;
    cashBalance: number;
    netCashMonth: number;
  };
}
