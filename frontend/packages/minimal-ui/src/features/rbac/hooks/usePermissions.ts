'use client';

import { useMemo } from 'react';

import { useAuthContext } from '@/components/ui/auth/hooks';
import { AuthUserPermissions } from '@/features/rbac/types';
import { buildPermissionCode, canViewPath, hasPermission } from '@/features/rbac/utils/permissions';
import {
  TENANT_MAIN_NAV,
  TenantNavPage,
  TenantNavSection,
  getSectionNavPages,
} from '@/features/tenant-panel/tenant-nav';

export function usePermissions() {
  const { user, loading } = useAuthContext();
  const authUser = user as AuthUserPermissions | null;

  const permissions = authUser?.permissions ?? [];
  const isSystemAdmin = Boolean(authUser?.isSystemAdmin);

  return useMemo(
    () => ({
      loading,
      permissions,
      isSystemAdmin,
      rbacRoleId: authUser?.rbacRoleId ?? null,
      rbacRoleCode: authUser?.rbacRoleCode ?? null,
      rbacRoleName: authUser?.rbacRoleName ?? null,
      can: (code: string) => hasPermission(permissions, isSystemAdmin, code),
      canViewPath: (hrefSuffix: string) => canViewPath(hrefSuffix, permissions, isSystemAdmin),
      canViewSection: (section: TenantNavSection) =>
        canViewPath(section.hrefSuffix, permissions, isSystemAdmin),
      canViewPage: (page: TenantNavPage, section?: TenantNavSection) =>
        canViewPath(page.hrefSuffix, permissions, isSystemAdmin),
      filterMainNav: () =>
        TENANT_MAIN_NAV.filter((item) => canViewPath(item.hrefSuffix, permissions, isSystemAdmin)),
      filterSectionPages: (section: TenantNavSection) =>
        getSectionNavPages(section).filter((page) =>
          canViewPath(page.hrefSuffix, permissions, isSystemAdmin),
        ),
      buildViewCode: (module: string, resource?: string | null) =>
        buildPermissionCode(module, 'VIEW', resource),
    }),
    [authUser, isSystemAdmin, loading, permissions],
  );
}
