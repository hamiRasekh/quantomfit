'use client';

import { CompanyUsersView } from '@/features/rbac/views/CompanyUsersView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyUsersPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyUsersView isDark={isDark} />;
}
