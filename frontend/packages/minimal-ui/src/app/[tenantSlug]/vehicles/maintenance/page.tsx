'use client';

import VehicleMaintenancePage from '@/app/_tenant-pages/vehicles/maintenance/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleMaintenancePage() {
  return (
    <TenantRoute>
      <VehicleMaintenancePage />
    </TenantRoute>
  );
}
