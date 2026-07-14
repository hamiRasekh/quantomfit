'use client';

import Page from '@/app/_tenant-pages/financial/cash-flow/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialCashFlowPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
