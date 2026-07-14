'use client';

import { OrderScheduleView } from '@/features/orders/views/OrderScheduleView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderSchedulePage() {
  const { isDark } = useTenantPageTheme();
  return <OrderScheduleView isDark={isDark} />;
}
