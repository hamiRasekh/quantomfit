'use client';

import Page from '@/app/_tenant-pages/orders/new/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderNewPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
