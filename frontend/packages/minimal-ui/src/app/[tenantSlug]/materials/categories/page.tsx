'use client';

import MaterialsCategoriesPage from '@/app/_tenant-pages/materials/categories/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantMaterialsCategoriesPage() {
  return (
    <TenantRoute>
      <MaterialsCategoriesPage />
    </TenantRoute>
  );
}
