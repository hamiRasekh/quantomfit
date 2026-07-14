'use client';

import VehiclesDashboardPage from '@/app/_tenant-pages/vehicles/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantVehiclesDashboardPage() {
  return (
    <TenantRoute>
      <VehiclesDashboardPage />
    </TenantRoute>
  );
}
