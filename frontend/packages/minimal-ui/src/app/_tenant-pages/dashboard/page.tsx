'use client';

import { MainDashboardView } from '@/features/tenant-panel/views/MainDashboardView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function DashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <MainDashboardView isDark={isDark} />;
}
