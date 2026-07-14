'use client';

import CompanyUsersPage from '@/app/_tenant-pages/company/users/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyUsersPage() {
  return (
    <TenantRoute>
      <CompanyUsersPage />
    </TenantRoute>
  );
}
