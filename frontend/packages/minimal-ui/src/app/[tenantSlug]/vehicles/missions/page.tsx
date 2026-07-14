'use client';

import VehicleMissionsPage from '@/app/_tenant-pages/vehicles/missions/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleMissionsPage() {
  return (
    <TenantRoute>
      <VehicleMissionsPage />
    </TenantRoute>
  );
}
