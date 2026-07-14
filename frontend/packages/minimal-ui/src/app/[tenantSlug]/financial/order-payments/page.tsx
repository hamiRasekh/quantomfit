'use client';

import Page from '@/app/_tenant-pages/financial/order-payments/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialOrderPaymentsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
