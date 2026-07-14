'use client';

import Grid from '@mui/material/Grid';

import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import { TenantNavLinkCard } from '../TenantNavLinkCard';
import { TENANT_MAIN_NAV, buildTenantHref, getSectionNavPages } from '../../tenant-nav';

type Props = {
  base: string;
  accent: string;
  isDark: boolean;
};

export function DashboardSectionAccess({ base, accent, isDark }: Props) {
  const { canViewPath } = usePermissions();
  const sectionItems = TENANT_MAIN_NAV.filter(
    (item) => item.section && item.hrefSuffix !== '/dashboard' && canViewPath(item.hrefSuffix),
  );

  return (
    <Grid container spacing={1.5}>
      {sectionItems.map((item) => (
        <Grid key={item.hrefSuffix} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <TenantNavLinkCard
            href={buildTenantHref(base, item.hrefSuffix)}
            label={item.label}
            icon={item.icon}
            accent={accent}
            isDark={isDark}
            description={
              item.section ? `${getSectionNavPages(item.section).length} زیربخش` : undefined
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}
