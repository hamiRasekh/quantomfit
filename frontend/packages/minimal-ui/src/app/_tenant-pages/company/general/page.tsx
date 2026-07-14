'use client';

import { CompanyGeneralView } from '@/features/company-settings/views/CompanyGeneralView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyGeneralPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyGeneralView isDark={isDark} />;
}
