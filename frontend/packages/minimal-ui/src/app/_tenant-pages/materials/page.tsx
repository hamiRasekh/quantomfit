'use client';

import { MaterialsSectionDashboard } from '@/features/tenant-panel/views/MaterialsSectionDashboard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function MaterialsDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <MaterialsSectionDashboard isDark={isDark} />;
}
