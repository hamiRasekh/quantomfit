'use client';

import { OrderReportsView } from '@/features/orders/views/OrderReportsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderReportsPage() {
  const { isDark } = useTenantPageTheme();
  return <OrderReportsView isDark={isDark} />;
}
