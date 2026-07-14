'use client';

import Page from '@/app/_tenant-pages/orders/schedule/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderSchedulePage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
