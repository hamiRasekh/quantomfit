'use client';

import PersonnelHrDashboardPage from '@/app/_tenant-pages/personnel/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantPersonnelDashboardPage() {
  return (
    <TenantRoute>
      <PersonnelHrDashboardPage />
    </TenantRoute>
  );
}
