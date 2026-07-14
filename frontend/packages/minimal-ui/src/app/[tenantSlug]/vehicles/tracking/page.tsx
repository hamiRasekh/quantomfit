'use client';

import VehicleTrackingPage from '@/app/_tenant-pages/vehicles/tracking/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleTrackingPage() {
  return (
    <TenantRoute>
      <VehicleTrackingPage />
    </TenantRoute>
  );
}
