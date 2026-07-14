'use client';

import Page from '@/app/_tenant-pages/orders/alerts/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderAlertsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
