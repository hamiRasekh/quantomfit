'use client';

import Page from '@/app/_tenant-pages/orders/financial/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderFinancialPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
