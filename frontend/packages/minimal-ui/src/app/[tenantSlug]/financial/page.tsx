'use client';

import FinancialDashboardPage from '@/app/_tenant-pages/financial/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantFinancialDashboardPage() {
  return (
    <TenantRoute>
      <FinancialDashboardPage />
    </TenantRoute>
  );
}
