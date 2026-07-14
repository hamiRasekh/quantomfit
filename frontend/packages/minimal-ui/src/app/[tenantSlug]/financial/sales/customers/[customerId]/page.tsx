'use client';

import Page from '@/app/_tenant-pages/financial/sales/customers/[customerId]/page';
import { TenantRoute } from '../../../../_components/TenantRoute';

export default function TenantCustomerFinancialProfilePage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
