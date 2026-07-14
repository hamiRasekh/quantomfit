'use client';

import { CompanySectionDashboard } from '@/features/company-settings/views/CompanySectionDashboard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanySectionDashboard isDark={isDark} />;
}
