'use client';

import { VehicleTrackingView } from '@/features/vehicles/views/VehicleTrackingView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleTrackingPage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleTrackingView isDark={isDark} />;
}
