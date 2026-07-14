'use client';

import MaterialsInvoicesPage from '@/app/_tenant-pages/materials/invoices/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantMaterialsInvoicesPage() {
  return (
    <TenantRoute>
      <MaterialsInvoicesPage />
    </TenantRoute>
  );
}
