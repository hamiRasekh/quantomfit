'use client';

import VehiclesListPage from '@/app/_tenant-pages/vehicles/list/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehiclesListPage() {
  return (
    <TenantRoute>
      <VehiclesListPage />
    </TenantRoute>
  );
}
