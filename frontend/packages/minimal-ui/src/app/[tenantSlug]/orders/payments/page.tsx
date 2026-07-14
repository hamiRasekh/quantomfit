'use client';

import Page from '@/app/_tenant-pages/orders/payments/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderPaymentsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
