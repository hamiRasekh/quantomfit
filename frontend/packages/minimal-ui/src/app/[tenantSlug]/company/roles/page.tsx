'use client';

import CompanyRolesPage from '@/app/_tenant-pages/company/roles/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyRolesPage() {
  return (
    <TenantRoute>
      <CompanyRolesPage />
    </TenantRoute>
  );
}
