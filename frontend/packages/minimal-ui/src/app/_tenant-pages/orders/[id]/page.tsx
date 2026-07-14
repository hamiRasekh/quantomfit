'use client';

import { use } from 'react';

import { OrderSalesDetailView } from '@/features/orders/views/OrderSalesDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <OrderSalesDetailView orderId={id} isDark={isDark} />;
}
