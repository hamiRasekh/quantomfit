'use client';

import { use } from 'react';

import { OrderSalesDetailView } from '@/features/orders/views/OrderSalesDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return (
    <TenantRoute>
      <OrderSalesDetailView orderId={id} isDark={isDark} />
    </TenantRoute>
  );
}
