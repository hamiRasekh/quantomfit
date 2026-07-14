'use client';

import { OrderAlertsView } from '@/features/orders/views/OrderAlertsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderAlertsPage() {
  const { isDark } = useTenantPageTheme();
  return <OrderAlertsView isDark={isDark} />;
}
