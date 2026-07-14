'use client';

import { CompanySystemSettingsView } from '@/features/company-settings/views/CompanySystemSettingsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanySystemSettingsPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanySystemSettingsView isDark={isDark} />;
}
