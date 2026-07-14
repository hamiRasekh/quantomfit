'use client';

import { MaterialsPurchaseInvoicesView } from '@/features/tenant-materials/views/MaterialsPurchaseInvoicesView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function MaterialsInvoicesPage() {
  const { isDark } = useTenantPageTheme();
  return <MaterialsPurchaseInvoicesView isDark={isDark} />;
}
