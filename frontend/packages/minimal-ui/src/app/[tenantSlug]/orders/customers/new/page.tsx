'use client';

import Page from '@/app/_tenant-pages/orders/customers/new/page';
import { TenantRoute } from '../../../_components/TenantRoute';

export default function TenantNewCustomerPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
