'use client';

import Page from '@/app/_tenant-pages/financial/receivables/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialReceivablesPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
