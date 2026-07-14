'use client';

import Page from '@/app/_tenant-pages/personnel/insights/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantPersonnelInsightsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
