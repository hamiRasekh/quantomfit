'use client';

import { use } from 'react';

import { HrDetailView } from '@/features/personnel-hr/views/HrDetailView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <HrDetailView employeeId={id} isDark={isDark} />;
}
