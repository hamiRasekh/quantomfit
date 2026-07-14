'use client';

import Page from '@/app/_tenant-pages/financial/cost-per-m3/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialCostPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
