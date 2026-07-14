'use client';

import CompanyGeneralPage from '@/app/_tenant-pages/company/general/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyGeneralPage() {
  return (
    <TenantRoute>
      <CompanyGeneralPage />
    </TenantRoute>
  );
}
