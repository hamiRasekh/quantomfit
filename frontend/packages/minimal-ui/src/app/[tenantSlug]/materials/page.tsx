'use client';

import MaterialsDashboardPage from '@/app/_tenant-pages/materials/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantMaterialsPage() {
  return (
    <TenantRoute>
      <MaterialsDashboardPage />
    </TenantRoute>
  );
}
