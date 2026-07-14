'use client';

import { MixSectionDashboard } from '@/features/concrete-mix/views/MixSectionDashboard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

export default function ConcreteMixDashboardPage() {
  const { isDark } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  return <MixSectionDashboard isDark={isDark} basePath={basePath} />;
}
