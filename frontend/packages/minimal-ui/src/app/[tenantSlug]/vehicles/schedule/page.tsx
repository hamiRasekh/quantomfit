'use client';

import VehicleSchedulePage from '@/app/_tenant-pages/vehicles/schedule/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleSchedulePage() {
  return (
    <TenantRoute>
      <VehicleSchedulePage />
    </TenantRoute>
  );
}
