'use client';

import { OrderPaymentsView } from '@/features/orders/views/OrderPaymentsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderPaymentsPage() {
  const { isDark } = useTenantPageTheme();
  return <OrderPaymentsView isDark={isDark} />;
}
