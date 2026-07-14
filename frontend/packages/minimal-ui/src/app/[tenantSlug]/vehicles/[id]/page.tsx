'use client';

import { use } from 'react';

import { VehicleDetailView } from '@/features/vehicles/views/VehicleDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantVehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return (
    <TenantRoute>
      <VehicleDetailView vehicleId={id} isDark={isDark} />
    </TenantRoute>
  );
}
