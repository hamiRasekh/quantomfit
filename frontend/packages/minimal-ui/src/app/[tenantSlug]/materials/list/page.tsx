'use client';

import MaterialsListPage from '@/app/_tenant-pages/materials/list/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantMaterialsListPage() {
  return (
    <TenantRoute>
      <MaterialsListPage />
    </TenantRoute>
  );
}
