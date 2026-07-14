'use client';

import { use } from 'react';

import { OrderCustomerProfileView } from '@/features/orders/views/OrderCustomerProfileView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderCustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <OrderCustomerProfileView customerId={id} isDark={isDark} />;
}
