'use client';

import { use } from 'react';

import { VehicleDetailView } from '@/features/vehicles/views/VehicleDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <VehicleDetailView vehicleId={id} isDark={isDark} />;
}
