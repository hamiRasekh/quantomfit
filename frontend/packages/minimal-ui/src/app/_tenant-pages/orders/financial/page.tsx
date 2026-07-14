'use client';

import { OrderFinancialView } from '@/features/orders/views/OrderFinancialView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderFinancialPage() {
  const { isDark } = useTenantPageTheme();
  return <OrderFinancialView isDark={isDark} />;
}
