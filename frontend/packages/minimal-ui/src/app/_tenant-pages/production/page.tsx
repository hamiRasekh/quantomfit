'use client';

import { ProductionSectionDashboard } from '@/features/tenant-production/views/ProductionSectionDashboard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function ProductionDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <ProductionSectionDashboard isDark={isDark} />;
}
