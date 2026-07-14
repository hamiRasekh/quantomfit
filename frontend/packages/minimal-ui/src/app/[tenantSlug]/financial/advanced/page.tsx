'use client';

import Page from '@/app/_tenant-pages/financial/advanced/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialAdvancedPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
