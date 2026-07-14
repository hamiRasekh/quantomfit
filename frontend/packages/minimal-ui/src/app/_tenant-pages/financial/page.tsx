'use client';

import { FinancialSectionDashboard } from '@/features/financial-dashboard/views/FinancialSectionDashboard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function FinancialDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <FinancialSectionDashboard isDark={isDark} />;
}
