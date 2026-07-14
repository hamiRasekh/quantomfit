'use client';

import MaterialsAttributesPage from '@/app/_tenant-pages/materials/attributes/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantMaterialsAttributesPage() {
  return (
    <TenantRoute>
      <MaterialsAttributesPage />
    </TenantRoute>
  );
}
