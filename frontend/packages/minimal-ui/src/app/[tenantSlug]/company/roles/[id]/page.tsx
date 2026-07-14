'use client';

import CompanyRolePermissionsPage from '@/app/_tenant-pages/company/roles/[id]/page';
import { TenantRoute } from '../../../_components/TenantRoute';

export default function TenantCompanyRolePermissionsPage() {
  return (
    <TenantRoute>
      <CompanyRolePermissionsPage />
    </TenantRoute>
  );
}
