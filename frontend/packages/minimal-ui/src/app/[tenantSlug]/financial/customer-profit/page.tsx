'use client';

import Page from '@/app/_tenant-pages/financial/customer-profit/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialCustomerProfitPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
