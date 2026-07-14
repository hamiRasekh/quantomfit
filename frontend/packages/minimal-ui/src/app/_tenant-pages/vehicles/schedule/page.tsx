'use client';

import { VehicleScheduleView } from '@/features/vehicles/views/VehicleScheduleView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleSchedulePage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleScheduleView isDark={isDark} />;
}
