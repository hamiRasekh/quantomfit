'use client';

import Page from '@/app/_tenant-pages/orders/customers/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrdersCustomersPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
