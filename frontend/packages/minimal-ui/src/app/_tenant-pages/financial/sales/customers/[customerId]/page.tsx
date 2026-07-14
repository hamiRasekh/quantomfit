'use client';

import { useParams } from 'next/navigation';

import { CustomerFinancialProfileView } from '@/features/financial-dashboard/views/CustomerFinancialProfileView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CustomerFinancialProfilePage() {
  const { isDark } = useTenantPageTheme();
  const params = useParams<{ customerId: string }>();
  const customerId = params.customerId;

  if (!customerId) return null;

  return <CustomerFinancialProfileView customerId={customerId} isDark={isDark} />;
}
