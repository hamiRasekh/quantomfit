'use client';

import Page from '@/app/_tenant-pages/orders/reports/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderReportsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
