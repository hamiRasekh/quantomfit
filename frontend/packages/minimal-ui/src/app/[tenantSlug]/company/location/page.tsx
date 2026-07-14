'use client';

import CompanyLocationPage from '@/app/_tenant-pages/company/location/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyLocationPage() {
  return (
    <TenantRoute>
      <CompanyLocationPage />
    </TenantRoute>
  );
}
