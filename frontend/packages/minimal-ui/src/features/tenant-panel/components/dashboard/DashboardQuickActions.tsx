'use client';

import Link from 'next/link';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassBadgeSx,
  tenantGlassHoverLiftSx,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';
import { buildTenantHref } from '../../tenant-nav';

type QuickAction = {
  label: string;
  description: string;
  icon: string;
  hrefSuffix: string;
  accentColor: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'ثبت سریع سفارش',
    description: 'سفارش جدید در چند ثانیه',
    icon: 'solar:add-circle-bold-duotone',
    hrefSuffix: '/orders/new',
    accentColor: TENANT_SHELL.brandRed,
  },
  {
    label: 'کتابخانه مواد',
    description: 'تعریف مصالح تولید بتن',
    icon: 'solar:box-bold-duotone',
    hrefSuffix: '/materials/list',
    accentColor: TENANT_SHELL.neonBlue,
  },
  {
    label: 'مشتری جدید',
    description: 'ثبت مشتری سریع',
    icon: 'solar:user-plus-bold-duotone',
    hrefSuffix: '/orders/customers/new',
    accentColor: TENANT_SHELL.brandBlueLight,
  },
  {
    label: 'انبارگردانی تولید',
    description: 'موجودی مصالح تولید بتن',
    icon: 'solar:transfer-horizontal-bold-duotone',
    hrefSuffix: '/materials/inventory',
    accentColor: TENANT_SHELL.brandBlue,
  },
];

type Props = {
  base: string;
  isDark: boolean;
};

export function DashboardQuickActions({ base, isDark }: Props) {
  const { canViewPath } = usePermissions();
  const actions = QUICK_ACTIONS.filter((action) => canViewPath(action.hrefSuffix));
  const textColor = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const mutedColor = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  if (!actions.length) return null;

  return (
    <Grid container spacing={1.75}>
      {actions.map((action) => {
        const href = buildTenantHref(base, action.hrefSuffix);

        return (
          <Grid key={action.hrefSuffix} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box
              component={Link}
              href={href}
              sx={{
                display: 'block',
                p: 2.25,
                textDecoration: 'none',
                minHeight: 124,
                color: textColor,
                ...tenantGlassSurfaceSx(isDark, {
                  accentColor: action.accentColor,
                  borderRadius: 3.5,
                }),
                ...tenantGlassHoverLiftSx(action.accentColor, isDark),
                '&:hover .qa-arrow': { transform: 'translateX(-4px)', opacity: 1 },
                '&:focus-visible': {
                  outline: `2px solid ${alpha(action.accentColor, 0.55)}`,
                  outlineOffset: 2,
                },
              }}
            >
              <Stack spacing={1.5} sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      ...tenantGlassBadgeSx(action.accentColor),
                    }}
                  >
                    <Iconify icon={action.icon} width={22} sx={{ color: action.accentColor }} />
                  </Box>
                  <Box
                    className="qa-arrow"
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(action.accentColor, 0.1),
                      border: `1px solid ${alpha(action.accentColor, 0.22)}`,
                      color: action.accentColor,
                      opacity: 0.85,
                      transition: 'transform 200ms ease, opacity 200ms ease',
                    }}
                  >
                    <Iconify icon="solar:arrow-left-linear" width={16} />
                  </Box>
                </Stack>
                <Box sx={{ mt: 'auto' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                    {action.label}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: mutedColor, mt: 0.4, lineHeight: 1.45 }}>
                    {action.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
