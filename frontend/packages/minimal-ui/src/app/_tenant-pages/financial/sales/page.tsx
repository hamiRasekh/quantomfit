'use client';

import { FinancialSalesHubView } from '@/features/financial-dashboard/views/FinancialSalesHubView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function FinancialSalesHubPage() {
  const { isDark } = useTenantPageTheme();
  return <FinancialSalesHubView isDark={isDark} />;
}
