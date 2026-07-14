'use client';

import CompanyPage from '@/app/_tenant-pages/company/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantCompanyPage() {
  return (
    <TenantRoute>
      <CompanyPage />
    </TenantRoute>
  );
}
