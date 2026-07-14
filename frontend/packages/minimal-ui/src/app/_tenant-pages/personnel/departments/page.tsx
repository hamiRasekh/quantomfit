'use client';

import { HrDepartmentsView } from '@/features/personnel-hr/views/HrDepartmentsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelDepartmentsPage() {
  const { isDark } = useTenantPageTheme();
  return <HrDepartmentsView isDark={isDark} />;
}
