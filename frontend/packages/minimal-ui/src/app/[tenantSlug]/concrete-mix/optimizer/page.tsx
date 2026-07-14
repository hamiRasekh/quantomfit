'use client';

import ConcreteMixOptimizerPage from '@/app/_tenant-pages/concrete-mix/optimizer/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantConcreteMixOptimizerPage() {
  return (
    <TenantRoute>
      <ConcreteMixOptimizerPage />
    </TenantRoute>
  );
}
