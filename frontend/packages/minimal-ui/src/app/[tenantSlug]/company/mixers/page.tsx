'use client';

import CompanyMixersPage from '@/app/_tenant-pages/company/mixers/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyMixersPage() {
  return (
    <TenantRoute>
      <CompanyMixersPage />
    </TenantRoute>
  );
}
