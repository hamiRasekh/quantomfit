'use client';

import CompanySystemSettingsPage from '@/app/_tenant-pages/company/system/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanySystemPage() {
  return (
    <TenantRoute>
      <CompanySystemSettingsPage />
    </TenantRoute>
  );
}
