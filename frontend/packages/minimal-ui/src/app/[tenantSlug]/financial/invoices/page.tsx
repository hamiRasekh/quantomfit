'use client';

import Page from '@/app/_tenant-pages/financial/invoices/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantFinancialInvoicesPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
