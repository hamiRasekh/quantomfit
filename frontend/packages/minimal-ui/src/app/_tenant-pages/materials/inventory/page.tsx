'use client';

import { MaterialsInventoryView } from '@/features/tenant-materials/views/MaterialsInventoryView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function MaterialsInventoryPage() {
  const { isDark } = useTenantPageTheme();
  return <MaterialsInventoryView isDark={isDark} />;
}
