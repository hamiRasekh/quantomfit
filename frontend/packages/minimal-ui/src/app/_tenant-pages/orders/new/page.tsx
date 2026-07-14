'use client';

import { ConcreteOrderNewForm } from '@/features/orders/components/ConcreteOrderNewForm';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderCreatePage() {
  const { isDark } = useTenantPageTheme();
  return <ConcreteOrderNewForm isDark={isDark} />;
}
