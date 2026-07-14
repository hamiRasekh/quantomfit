'use client';

import { HrDashboardView } from '@/features/personnel-hr/views/HrDashboardView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelHrDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <HrDashboardView isDark={isDark} />;
}
