'use client';

import Page from '@/app/_tenant-pages/financial/sales/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialSalesPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
