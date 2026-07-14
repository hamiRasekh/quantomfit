'use client';

import { VehicleFuelView } from '@/features/vehicles/views/VehicleFuelView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleFuelPage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleFuelView isDark={isDark} />;
}
