import { FinancialPageId } from '../types';
import { FINANCIAL_HUBS } from './hubs';

export type FinancialNavPage = {
  label: string;
  hrefSuffix: string;
  icon: string;
  pageId?: FinancialPageId;
};

/** Hub entry points shown on the financial dashboard */
export const FINANCIAL_SECTION_PAGES: FinancialNavPage[] = [
  { label: 'داشبورد مالی', hrefSuffix: '/financial', icon: 'solar:wallet-money-bold-duotone' },
  ...FINANCIAL_HUBS.map((hub) => ({
    label: hub.label,
    hrefSuffix: hub.path,
    icon: hub.icon,
  })),
];

export const FINANCIAL_PAGE_BY_SUFFIX: Record<string, FinancialPageId> = {
  '/financial/overview': 'overview',
  '/financial/plants': 'plants',
  '/financial/cost-per-m3': 'cost-per-m3',
  '/financial/sales': 'sales',
  '/financial/receivables': 'receivables',
  '/financial/payables': 'payables',
  '/financial/cash-flow': 'cash-flow',
  '/financial/materials-cost': 'materials-cost',
  '/financial/fleet': 'fleet',
  '/financial/customer-profit': 'customer-profit',
  '/financial/contracts': 'contracts',
  '/financial/invoices': 'invoices',
  '/financial/inventory-value': 'inventory-value',
  '/financial/budget': 'budget',
  '/financial/alerts': 'alerts',
};
