'use client';

import { useParams } from 'next/navigation';

import { CompanyRolePermissionsView } from '@/features/rbac/views/CompanyRolePermissionsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyRolePermissionsPage() {
  const params = useParams();
  const { isDark } = useTenantPageTheme();
  const roleId = params.id as string;

  return <CompanyRolePermissionsView roleId={roleId} isDark={isDark} />;
}
