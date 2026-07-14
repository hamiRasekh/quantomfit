'use client';

import { use } from 'react';

import { ConcreteOrderNewForm } from '@/features/orders/components/ConcreteOrderNewForm';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function OrderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <ConcreteOrderNewForm isDark={isDark} orderId={id} />;
}
