'use client';

import Page from '@/app/_tenant-pages/financial/inventory-value/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialInventoryPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
