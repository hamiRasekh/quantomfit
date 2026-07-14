'use client';

import { VehiclesListView } from '@/features/vehicles/views/VehiclesListView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehiclesListPage() {
  const { isDark } = useTenantPageTheme();
  return <VehiclesListView isDark={isDark} />;
}
