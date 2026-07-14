'use client';

import { OrdersSalesListView } from '@/features/orders/views/OrdersSalesListView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrdersListPage() {
  const { isDark } = useTenantPageTheme();
  return <OrdersSalesListView isDark={isDark} />;
}
