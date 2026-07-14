'use client';

import { use } from 'react';

import { HrEditEmployeeView } from '@/features/personnel-hr/views/HrEditEmployeeView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDark } = useTenantPageTheme();
  return <HrEditEmployeeView employeeId={id} isDark={isDark} />;
}
