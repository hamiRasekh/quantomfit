'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { personnelHrApi } from '../api/personnelHrApi';
import { HrDashboard } from '../types';
import { displayNum } from '../utils/display';

type Props = { isDark: boolean };

export function HrDashboardView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HrDashboard | null>(null);

  useEffect(() => {
    personnelHrApi.getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  const kpis = [
    { label: 'کل پرسنل', value: displayNum(data?.total), icon: 'solar:users-group-rounded-bold-duotone' },
    { label: 'فعال', value: displayNum(data?.active), icon: 'solar:user-check-bold-duotone' },
    { label: 'رانندگان', value: displayNum(data?.drivers), icon: 'solar:bus-bold-duotone' },
    { label: 'هشدار', value: displayNum(data?.openAlerts), icon: 'solar:danger-bold-duotone' },
    { label: 'مرخصی معوق', value: displayNum(data?.pendingLeave), icon: 'solar:calendar-bold-duotone' },
  ];

  const links = [
    ['/personnel/list', 'پرسنل'],
    ['/personnel/departments', 'واحد و سمت'],
    ['/personnel/work', 'کار و حضور'],
    ['/personnel/compensation', 'حقوق و مرخصی'],
    ['/personnel/insights', 'گزارش پرسنل'],
  ] as const;

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="داشبورد پرسنل"
        isDark={isDark}
        action={
          <Button component={Link} href={buildTenantHref(basePath, '/personnel/new')} variant="contained" sx={{ bgcolor: colors.primary }}>
            پرسنل جدید
          </Button>
        }
      />
      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 4 }}>
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon={k.icon} width={26} sx={{ color: colors.primary }} />
                <Stack>
                  <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{k.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{k.value}</Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {links.map(([href, label]) => (
          <Button key={href} component={Link} href={buildTenantHref(basePath, href)} variant="outlined" size="small">
            {label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
