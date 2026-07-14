'use client';

import { use } from 'react';

import { HrDetailView } from '@/features/personnel-hr/views/HrDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantPersonnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return (
    <TenantRoute>
      <HrDetailView employeeId={id} isDark={isDark} />
    </TenantRoute>
  );
}
