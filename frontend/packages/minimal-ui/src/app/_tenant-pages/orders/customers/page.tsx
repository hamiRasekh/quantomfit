'use client';

import { OrdersCustomersView } from '@/features/orders/views/OrdersCustomersView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrdersCustomersPage() {
  const { isDark } = useTenantPageTheme();
  return <OrdersCustomersView isDark={isDark} />;
}
