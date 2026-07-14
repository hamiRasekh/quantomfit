'use client';

import { use } from 'react';

import { OrderCustomerProfileView } from '@/features/orders/views/OrderCustomerProfileView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { TenantRoute } from '../../../_components/TenantRoute';

export default function TenantOrderCustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return (
    <TenantRoute>
      <OrderCustomerProfileView customerId={id} isDark={isDark} />
    </TenantRoute>
  );
}
