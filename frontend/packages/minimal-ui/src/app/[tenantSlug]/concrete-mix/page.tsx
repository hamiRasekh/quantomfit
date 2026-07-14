'use client';

import ConcreteMixDashboardPage from '@/app/_tenant-pages/concrete-mix/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantConcreteMixPage() {
  return (
    <TenantRoute>
      <ConcreteMixDashboardPage />
    </TenantRoute>
  );
}
