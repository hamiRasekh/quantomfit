'use client';

import MaterialsInventoryPage from '@/app/_tenant-pages/materials/inventory/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantMaterialsInventoryPage() {
  return (
    <TenantRoute>
      <MaterialsInventoryPage />
    </TenantRoute>
  );
}
