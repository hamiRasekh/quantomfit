'use client';

import { FinancialCogsHubView } from '@/features/financial-dashboard/views/FinancialCogsHubView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function FinancialCogsHubPage() {
  const { isDark } = useTenantPageTheme();
  return <FinancialCogsHubView isDark={isDark} />;
}
