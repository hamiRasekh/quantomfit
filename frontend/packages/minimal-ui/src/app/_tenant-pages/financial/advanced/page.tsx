'use client';

import { FinancialAdvancedView } from '@/features/financial-dashboard/views/FinancialAdvancedView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function FinancialAdvancedHubPage() {
  const { isDark } = useTenantPageTheme();
  return <FinancialAdvancedView isDark={isDark} />;
}
