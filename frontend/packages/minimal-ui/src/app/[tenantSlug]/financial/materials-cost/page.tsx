'use client';

import Page from '@/app/_tenant-pages/financial/materials-cost/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialMaterialsCostPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
