'use client';

import Page from '@/app/_tenant-pages/financial/overview/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialOverviewPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
