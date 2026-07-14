'use client';

import { VehicleAlertsView } from '@/features/vehicles/views/VehicleAlertsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleAlertsPage() {
  const { isDark } = useTenantPageTheme();
  return <VehicleAlertsView isDark={isDark} />;
}
