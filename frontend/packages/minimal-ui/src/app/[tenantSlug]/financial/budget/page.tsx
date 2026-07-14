'use client';

import Page from '@/app/_tenant-pages/financial/budget/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialBudgetPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
