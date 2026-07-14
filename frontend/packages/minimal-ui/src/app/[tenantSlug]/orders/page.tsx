'use client';

import OrdersDashboardPage from '@/app/_tenant-pages/orders/page';
import { TenantRoute } from '../_components/TenantRoute';

export default function TenantOrdersPage() {
  return (
    <TenantRoute>
      <OrdersDashboardPage />
    </TenantRoute>
  );
}
