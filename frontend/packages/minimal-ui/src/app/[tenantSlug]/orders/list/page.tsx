'use client';

import OrdersListPage from '@/app/_tenant-pages/orders/list/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrdersListPage() {
  return (
    <TenantRoute>
      <OrdersListPage />
    </TenantRoute>
  );
}
