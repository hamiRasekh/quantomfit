'use client';

import { OrdersSalesDashboardView } from '@/features/orders/views/OrdersSalesDashboardView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrdersDashboardPage() {
  const { isDark } = useTenantPageTheme();
  return <OrdersSalesDashboardView isDark={isDark} />;
}
