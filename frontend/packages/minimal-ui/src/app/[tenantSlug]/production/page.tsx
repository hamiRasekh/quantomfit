'use client';

import ProductionDashboardPage from '@/app/_tenant-pages/production/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantProductionPage() {
  return (
    <TenantRoute>
      <ProductionDashboardPage />
    </TenantRoute>
  );
}
