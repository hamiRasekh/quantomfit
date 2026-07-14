'use client';

import VehicleAlertsPage from '@/app/_tenant-pages/vehicles/alerts/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleAlertsPage() {
  return (
    <TenantRoute>
      <VehicleAlertsPage />
    </TenantRoute>
  );
}
