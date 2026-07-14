'use client';

import ConcreteMixPredictorPage from '@/app/_tenant-pages/concrete-mix/predictor/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantConcreteMixPredictorPage() {
  return (
    <TenantRoute>
      <ConcreteMixPredictorPage />
    </TenantRoute>
  );
}
