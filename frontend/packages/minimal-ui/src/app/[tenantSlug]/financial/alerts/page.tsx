'use client';

import Page from '@/app/_tenant-pages/financial/alerts/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialAlertsPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
