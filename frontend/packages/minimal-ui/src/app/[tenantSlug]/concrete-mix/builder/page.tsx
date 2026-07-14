'use client';

import ConcreteMixBuilderPage from '@/app/_tenant-pages/concrete-mix/builder/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantConcreteMixBuilderPage() {
  return (
    <TenantRoute>
      <ConcreteMixBuilderPage />
    </TenantRoute>
  );
}
