'use client';

import { CompanyLocationView } from '@/features/company-settings/views/CompanyLocationView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyLocationPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyLocationView isDark={isDark} />;
}
