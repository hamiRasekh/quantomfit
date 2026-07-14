'use client';

import ConcreteMixResultsPage from '@/app/_tenant-pages/concrete-mix/results/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantConcreteMixResultsPage() {
  return (
    <TenantRoute>
      <ConcreteMixResultsPage />
    </TenantRoute>
  );
}
