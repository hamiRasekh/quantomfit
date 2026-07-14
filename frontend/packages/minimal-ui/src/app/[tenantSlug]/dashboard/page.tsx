'use client';

import DashboardPage from '@/app/_tenant-pages/dashboard/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantDashboardPage() {
  return (
    <TenantRoute>
      <DashboardPage />
    </TenantRoute>
  );
}
