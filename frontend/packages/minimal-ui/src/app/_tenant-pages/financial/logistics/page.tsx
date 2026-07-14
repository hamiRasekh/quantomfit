'use client';

import { FinancialLogisticsHubView } from '@/features/financial-dashboard/views/FinancialLogisticsHubView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function FinancialLogisticsHubPage() {
  const { isDark } = useTenantPageTheme();
  return <FinancialLogisticsHubView isDark={isDark} />;
}
