import type { ReactNode } from 'react';

import { FinancialCurrencyUnit } from '@/features/tenant-panel/theme';

export type FinancialFilters = {
  dateFrom?: string;
  dateTo?: string;
  plantId?: string;
  customerId?: string;
  projectId?: string;
  concreteGrade?: string;
  paymentStatus?: string;
  supplierId?: string;
  fleetId?: string;
};

export type FinancialKpi = {
  id: string;
  label: string;
  value: string;
  rawValue?: number;
  unit?: 'currency' | 'percent' | 'm3' | 'days' | 'count' | 'km';
  hint?: string;
  trend?: number;
  severity?: 'normal' | 'warning' | 'danger' | 'success';
  icon?: string;
};

export type FinancialChartSeries = {
  categories: string[];
  series: Array<{ name: string; data: number[] }>;
};

export type FinancialTableColumn = {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
};

export type FinancialTableRow = Record<string, string | number | null | undefined | ReactNode>;

export type FinancialAlert = {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  createdAt: string;
  entityType?: string;
  entityId?: string;
};

export type FinancialOverview = {
  kpis: FinancialKpi[];
  salesTrend: FinancialChartSeries;
  cashFlowTrend: FinancialChartSeries;
  alerts: FinancialAlert[];
};

export type PlantProfitability = {
  plantId: string;
  plantName: string;
  revenue: number;
  materialCost: number;
  productionCost: number;
  transportCost: number;
  pumpCost: number;
  overheadCost: number;
  volumeM3: number;
};

export type ConcreteCostBreakdown = {
  grade: string;
  mixCode: string;
  sellingPricePerM3: number;
  cementCost: number;
  sandCost: number;
  gravelCost: number;
  admixtureCost: number;
  waterCost: number;
  otherMaterialCost: number;
  productionCost: number;
  transportCost: number;
  pumpCost: number;
  overheadCost: number;
  wasteCost: number;
  totalCostPerM3: number;
  profitPerM3: number;
  marginPercent: number;
  volumeM3: number;
  aiStandardCostPerM3?: number;
};

export type CustomerReceivable = {
  customerId: string;
  customerName: string;
  totalReceivable: number;
  current: number;
  overdue: number;
  aging0_30: number;
  aging31_60: number;
  aging61_90: number;
  aging90Plus: number;
  creditLimit: number;
  creditBalance: number;
  dsoDays: number;
  checksPending: number;
};

export type SupplierPayable = {
  supplierId: string;
  supplierName: string;
  category: string;
  totalPayable: number;
  dueThisWeek: number;
  unpaidInvoices: number;
  avgUnitPrice: number;
};

export type CashFlowItem = {
  label: string;
  bankBalance: number;
  cashBalance: number;
  inToday: number;
  outToday: number;
  inWeek: number;
  outWeek: number;
  inMonth: number;
  outMonth: number;
  forecast7: number;
  forecast30: number;
};

export type MaterialCostItem = {
  materialKey: string;
  materialName: string;
  consumedQty: number;
  consumedAmount: number;
  avgPurchasePrice: number;
  stockQty: number;
  stockValue: number;
  variancePercent: number;
  wastePercent: number;
  priceTrendPercent: number;
  profitImpactPerM3: number;
};

export type FleetCostItem = {
  vehicleId: string;
  vehicleName: string;
  fuelCost: number;
  maintenanceCost: number;
  driverCost: number;
  depreciationCost: number;
  trips: number;
  volumeM3: number;
  costPerM3: number;
  costPerKm: number;
  returnConcreteM3: number;
};

export type ProjectProfitability = {
  entityId: string;
  entityName: string;
  entityType: 'customer' | 'project';
  volumeM3: number;
  revenue: number;
  avgSellingPrice: number;
  actualCost: number;
  grossProfit: number;
  marginPercent: number;
  balanceDue: number;
  paymentStatus: string;
  orderCount: number;
  returnM3: number;
  discountAmount: number;
  rank?: number;
};

export type ContractFinancialStatus = {
  id: string;
  title: string;
  type: 'quote' | 'contract' | 'order';
  amount: number;
  status: string;
  risk: 'low' | 'medium' | 'high';
  marginPercent?: number;
  creditRisk?: boolean;
};

export type InvoiceReconciliation = {
  id: string;
  orderNo: string;
  customerName: string;
  deliveredM3: number;
  invoicedM3: number;
  varianceM3: number;
  invoicedAmount: number;
  paidAmount: number;
  returnM3: number;
  status: string;
};

export type InventoryValuation = {
  materialName: string;
  quantity: number;
  unit: string;
  value: number;
  turnoverDays: number;
  minStock: number;
  isCritical: boolean;
  varianceQty: number;
};

export type BudgetVariance = {
  category: string;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  achievementPercent: number;
};

export type FinancialPagePayload = {
  title: string;
  description: string;
  kpis: FinancialKpi[];
  charts: Array<{
    id: string;
    title: string;
    subtitle?: string;
    type: 'bar' | 'area' | 'line' | 'donut';
    categories: string[];
    series: Array<{ name: string; data: number[] }> | number[];
  }>;
  tables: Array<{
    id: string;
    title: string;
    columns: FinancialTableColumn[];
    rows: FinancialTableRow[];
  }>;
  alerts: FinancialAlert[];
};

export type FinancialPageId =
  | 'overview'
  | 'plants'
  | 'cost-per-m3'
  | 'sales'
  | 'receivables'
  | 'payables'
  | 'cash-flow'
  | 'materials-cost'
  | 'fleet'
  | 'customer-profit'
  | 'contracts'
  | 'invoices'
  | 'inventory-value'
  | 'budget'
  | 'alerts';

export type FinancialDashboardContext = {
  filters: FinancialFilters;
  currencyUnit: FinancialCurrencyUnit;
};
