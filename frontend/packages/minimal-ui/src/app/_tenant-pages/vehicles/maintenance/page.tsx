'use client';

import { VehicleMaintenanceView } from '@/features/vehicles/views/VehicleMaintenanceView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleMaintenancePage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleMaintenanceView isDark={isDark} />;
}
