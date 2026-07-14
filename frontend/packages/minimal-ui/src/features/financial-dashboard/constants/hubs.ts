import { FinancialPageId } from '../types';

export type FinancialHubId = 'sales' | 'cogs' | 'logistics' | 'advanced';

export type FinancialHubTab = {
  id: string;
  label: string;
  icon: string;
  pageId?: FinancialPageId;
  customView?: 'customers' | 'payments' | 'material-purchases' | 'company-expenses' | 'depreciation' | 'non-operating';
};

export type FinancialHubConfig = {
  id: FinancialHubId;
  label: string;
  description: string;
  path: string;
  icon: string;
  tabs: FinancialHubTab[];
};

export const FINANCIAL_HUBS: FinancialHubConfig[] = [
  {
    id: 'sales',
    label: 'فروش و اعتبار',
    description: 'پروفایل مالی مشتری، فاکتورها، مانده حساب و وصولی‌ها',
    path: '/financial/sales',
    icon: 'solar:cart-large-2-bold-duotone',
    tabs: [
      { id: 'customers', label: 'مشتریان', icon: 'solar:users-group-rounded-bold-duotone', customView: 'customers' },
      { id: 'sales', label: 'فروش و درآمد', icon: 'solar:graph-up-bold-duotone', pageId: 'sales' },
      { id: 'receivables', label: 'مانده و مطالبات', icon: 'solar:bill-list-bold-duotone', pageId: 'receivables' },
      { id: 'contracts', label: 'پیش‌فاکتور / قرارداد', icon: 'solar:document-text-bold-duotone', pageId: 'contracts' },
      { id: 'invoices', label: 'فاکتور و مغایرت', icon: 'solar:clipboard-check-bold-duotone', pageId: 'invoices' },
      { id: 'payments', label: 'وصولی‌ها', icon: 'solar:wallet-check-bold-duotone', customView: 'payments' },
      { id: 'customer-profit', label: 'سودآوری مشتری', icon: 'solar:medal-ribbons-star-bold-duotone', pageId: 'customer-profit' },
    ],
  },
  {
    id: 'cogs',
    label: 'هزینه های عملیاتی',
    description: 'مواد، دستمزد تولید و سربار کارگاه',
    path: '/financial/cogs',
    icon: 'solar:box-bold-duotone',
    tabs: [
      { id: 'material-purchases', label: 'خرید مواد', icon: 'solar:bill-list-bold-duotone', customView: 'material-purchases' },
      { id: 'materials-cost', label: 'هزینه مواد تولید', icon: 'solar:box-bold-duotone', pageId: 'materials-cost' },
      { id: 'company-expenses', label: 'سربار کارگاه', icon: 'solar:cart-3-bold-duotone', customView: 'company-expenses' },
      { id: 'cost-per-m3', label: 'بهای تمام‌شده m³', icon: 'solar:calculator-bold-duotone', pageId: 'cost-per-m3' },
      { id: 'payables', label: 'بدهی تأمین‌کنندگان', icon: 'solar:hand-money-bold-duotone', pageId: 'payables' },
    ],
  },
  {
    id: 'logistics',
    label: 'لجستیک و ناوگان',
    description: 'کارکرد میکسر، پمپ و هزینه حمل',
    path: '/financial/logistics',
    icon: 'solar:bus-bold-duotone',
    tabs: [
      { id: 'fleet', label: 'کارکرد میکسر', icon: 'solar:bus-bold-duotone', pageId: 'fleet' },
      { id: 'drivers', label: 'پیمانکار راننده', icon: 'solar:user-id-bold-duotone' },
      { id: 'pump', label: 'پمپ دکل/زمینی', icon: 'solar:waterdrops-bold-duotone' },
      { id: 'idle-penalty', label: 'جریمه معطلی', icon: 'solar:clock-circle-bold-duotone' },
    ],
  },
  {
    id: 'advanced',
    label: 'حسابداری ارشد',
    description: 'استهلاک، هزینه غیرعملیاتی و گزارشات کلان',
    path: '/financial/advanced',
    icon: 'solar:settings-bold-duotone',
    tabs: [
      { id: 'depreciation', label: 'استهلاک دارایی', icon: 'solar:buildings-2-bold-duotone', customView: 'depreciation' },
      { id: 'non-operating', label: 'هزینه غیرعملیاتی', icon: 'solar:danger-bold-duotone', customView: 'non-operating' },
      { id: 'budget', label: 'بودجه و انحراف', icon: 'solar:target-bold-duotone', pageId: 'budget' },
      { id: 'plants', label: 'سود/زیان کارخانه', icon: 'solar:chart-2-bold-duotone', pageId: 'plants' },
      { id: 'inventory-value', label: 'ارزش موجودی', icon: 'solar:archive-bold-duotone', pageId: 'inventory-value' },
    ],
  },
];

export const FINANCIAL_HUB_BY_ID = Object.fromEntries(
  FINANCIAL_HUBS.map((hub) => [hub.id, hub]),
) as Record<FinancialHubId, FinancialHubConfig>;

/** Legacy sidebar paths → hub + tab query */
export const FINANCIAL_LEGACY_REDIRECTS: Record<string, { hub: FinancialHubId; tab: string }> = {
  '/financial/overview': { hub: 'sales', tab: 'sales' },
  '/financial/plants': { hub: 'advanced', tab: 'plants' },
  '/financial/cost-per-m3': { hub: 'cogs', tab: 'cost-per-m3' },
  '/financial/sales': { hub: 'sales', tab: 'sales' },
  '/financial/order-payments': { hub: 'sales', tab: 'payments' },
  '/financial/receivables': { hub: 'sales', tab: 'receivables' },
  '/financial/payables': { hub: 'cogs', tab: 'payables' },
  '/financial/cash-flow': { hub: 'sales', tab: 'receivables' },
  '/financial/material-purchases': { hub: 'cogs', tab: 'material-purchases' },
  '/financial/company-expenses': { hub: 'cogs', tab: 'company-expenses' },
  '/financial/materials-cost': { hub: 'cogs', tab: 'materials-cost' },
  '/financial/fleet': { hub: 'logistics', tab: 'fleet' },
  '/financial/customer-profit': { hub: 'sales', tab: 'customer-profit' },
  '/financial/contracts': { hub: 'sales', tab: 'contracts' },
  '/financial/invoices': { hub: 'sales', tab: 'invoices' },
  '/financial/inventory-value': { hub: 'advanced', tab: 'inventory-value' },
  '/financial/budget': { hub: 'advanced', tab: 'budget' },
  '/financial/alerts': { hub: 'advanced', tab: 'budget' },
};

export function resolveFinancialLegacyRedirect(
  pathname: string,
  basePath: string,
): string | null {
  const prefix = basePath.replace(/\/$/, '');
  const suffix = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  const normalized = suffix.split('?')[0] || '/financial';
  const mapping = FINANCIAL_LEGACY_REDIRECTS[normalized];
  if (!mapping) return null;
  const hub = FINANCIAL_HUB_BY_ID[mapping.hub];
  return `${prefix}${hub.path}?tab=${mapping.tab}`;
}

export function getHubTab(hubId: FinancialHubId, tabId: string | null): FinancialHubTab {
  const hub = FINANCIAL_HUB_BY_ID[hubId];
  return hub.tabs.find((t) => t.id === tabId) ?? hub.tabs[0];
}
