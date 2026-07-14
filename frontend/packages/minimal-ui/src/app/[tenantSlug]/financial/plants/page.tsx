'use client';

import Page from '@/app/_tenant-pages/financial/plants/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialPlantsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
