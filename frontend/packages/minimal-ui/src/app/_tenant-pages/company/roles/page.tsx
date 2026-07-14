'use client';

import { CompanyRolesListView } from '@/features/rbac/views/CompanyRolesListView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyRolesPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyRolesListView isDark={isDark} />;
}
