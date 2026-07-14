'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Iconify } from '@/components/ui/iconify';
import { TenantChartCard } from '@/features/tenant-panel/components/TenantChartCard';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { vehiclesApi } from '../api/vehiclesApi';
import { FleetDashboard } from '../types';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';

type Props = { isDark: boolean };

export function VehiclesDashboardView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FleetDashboard | null>(null);

  const load = () =>
    vehiclesApi
      .getDashboard()
      .then(setData)
      .catch((error) => notifyApiError(error, 'خطا در بارگذاری داشبورد ناوگان'));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const text = isDark ? '#EAF2FF' : '#04044A';

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  if (!data) {
    return <Alert severity="info">داده‌ای برای نمایش نیست. از دکمه «داده نمایشی» استفاده کنید.</Alert>;
  }

  const kpis = [
    { label: 'کل خودروها', value: data.totalVehicles, icon: 'solar:bus-bold-duotone' },
    { label: 'فعال', value: data.activeVehicles, icon: 'solar:check-circle-bold-duotone' },
    { label: 'آماده', value: data.ready, icon: 'solar:play-circle-bold-duotone' },
    { label: 'در مأموریت', value: data.inMission, icon: 'solar:route-bold-duotone' },
    { label: 'در سرویس', value: data.inService, icon: 'solar:wrench-bold-duotone' },
    { label: 'خراب', value: data.broken, icon: 'solar:danger-bold-duotone', warn: true },
    { label: 'مأموریت امروز', value: data.todayMissions, icon: 'solar:calendar-bold-duotone' },
    { label: 'تأخیر امروز', value: data.todayDelays, icon: 'solar:clock-circle-bold-duotone', warn: data.todayDelays > 0 },
  ];

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="داشبورد ناوگان"
        isDark={isDark}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() =>
                vehiclesApi.seedDemo().then(() => {
                  toast.success('داده نمایشی ایجاد شد');
                  load();
                }).catch((e: { response?: { data?: { message?: string } } }) =>
                  toast.error(e?.response?.data?.message || 'خطا'),
                )
              }
            >
              داده نمایشی
            </Button>
            <Button
              component={Link}
              href={buildTenantHref(basePath, '/vehicles/list')}
              variant="contained"
              sx={{ bgcolor: colors.primary }}
            >
              لیست خودروها
            </Button>
          </Stack>
        }
      />

      <Typography sx={{ fontSize: 14, opacity: 0.75, color: text }}>
        مدیریت میکسرها، مأموریت، سرویس و ردیابی نمایشی GPS.
      </Typography>

      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, sm: 4, md: 3 }}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(k.warn ? '#f44336' : colors.primary, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(colors.primary, 0.12),
                  }}
                >
                  <Iconify icon={k.icon} width={22} sx={{ color: colors.primary }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{k.label}</Typography>
                  <Typography sx={{ fontWeight: 800, fontSize: 20 }}>{k.value}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TenantChartCard
            title="وضعیت خودروها"
            isDark={isDark}
            type="donut"
            categories={data.statusChart.filter((s) => s.count > 0).map((s) => s.status)}
            series={data.statusChart.filter((s) => s.count > 0).map((s) => s.count)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TenantChartCard
            title="مأموریت‌های هفتگی"
            isDark={isDark}
            type="bar"
            categories={data.weeklyMissions.map((d) => d.day)}
            series={[{ name: 'مأموریت', data: data.weeklyMissions.map((d) => d.count) }]}
          />
        </Grid>
      </Grid>

      {data.alerts.length > 0 && (
        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800, mb: 1.5 }}>هشدارهای مهم</Typography>
          <Stack spacing={1}>
            {data.alerts.slice(0, 6).map((a) => (
              <Alert key={a.id} severity={a.severity === 'CRITICAL' ? 'error' : 'warning'}>
                <strong>{a.title}</strong> — {a.description}
              </Alert>
            ))}
          </Stack>
          <Button
            component={Link}
            href={buildTenantHref(basePath, '/vehicles/alerts')}
            sx={{ mt: 2 }}
            size="small"
          >
            همه هشدارها
          </Button>
        </Card>
      )}

      {data.followUpVehicles.length > 0 && (
        <Card sx={{ p: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>نیازمند پیگیری</Typography>
          <Stack spacing={1}>
            {data.followUpVehicles.map((v) => (
              <Stack
                key={v.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                component={Link}
                href={buildTenantHref(basePath, `/vehicles/${v.id}`)}
                sx={{ textDecoration: 'none', color: 'inherit', py: 0.5 }}
              >
                <Typography>
                  {v.vehicleCode} — {v.plateNumber}
                </Typography>
                <VehicleStatusBadge status={v.status} />
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
