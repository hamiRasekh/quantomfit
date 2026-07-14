'use client';

import { MaterialsListView } from '@/features/tenant-materials/views/MaterialsListView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function MaterialsListPage() {
  const { isDark } = useTenantPageTheme();
  return <MaterialsListView isDark={isDark} />;
}
