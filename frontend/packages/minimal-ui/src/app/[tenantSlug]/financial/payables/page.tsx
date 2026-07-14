'use client';

import Page from '@/app/_tenant-pages/financial/payables/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialPayablesPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
