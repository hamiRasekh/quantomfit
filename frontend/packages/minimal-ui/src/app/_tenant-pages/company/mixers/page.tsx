'use client';

import { CompanyBatchingMixersView } from '@/features/company-settings/views/CompanyBatchingMixersView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyMixersPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyBatchingMixersView isDark={isDark} />;
}
