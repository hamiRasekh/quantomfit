'use client';

import { VehicleMissionsView } from '@/features/vehicles/views/VehicleMissionsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleMissionsPage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleMissionsView isDark={isDark} />;
}
