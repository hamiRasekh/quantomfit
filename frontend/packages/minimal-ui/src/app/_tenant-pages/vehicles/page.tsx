'use client';

import { VehiclesDashboardView } from '@/features/vehicles/views/VehiclesDashboardView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehiclesDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <VehiclesDashboardView isDark={isDark} />;
}
