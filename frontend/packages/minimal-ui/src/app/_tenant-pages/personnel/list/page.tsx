'use client';

import { HrListView } from '@/features/personnel-hr/views/HrListView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelListPage() {
  const { isDark } = useTenantPageTheme();
  return <HrListView isDark={isDark} />;
}
