'use client';

import { HrNewEmployeeView } from '@/features/personnel-hr/views/HrNewEmployeeView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelNewPage() {
  const { isDark } = useTenantPageTheme();
  return <HrNewEmployeeView isDark={isDark} />;
}
