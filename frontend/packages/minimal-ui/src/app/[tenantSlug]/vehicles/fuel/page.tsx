'use client';

import VehicleFuelPage from '@/app/_tenant-pages/vehicles/fuel/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleFuelPage() {
  return (
    <TenantRoute>
      <VehicleFuelPage />
    </TenantRoute>
  );
}
