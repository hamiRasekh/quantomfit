'use client';

import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { settingsApi } from '@/features/settings/api/settingsApi';
import { workCalendarApi } from '@/features/work-calendar/api/workCalendarApi';
import { FINANCIAL_CURRENCY_OPTIONS, TENANT_ACCENT_OPTIONS } from '@/features/tenant-panel/theme';
import { TenantStatCard } from '@/features/tenant-panel/components/TenantStatCard';
import { TenantChartCard } from '@/features/tenant-panel/components/TenantChartCard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

type Props = { isDark: boolean };

export function CompanySectionDashboard({ isDark }: Props) {
  const { colors, financialCurrencyUnit, accent } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('-');
  const [mixersCount, setMixersCount] = useState(0);
  const [profileScore, setProfileScore] = useState(0);
  const [mixerLabels, setMixerLabels] = useState<string[]>([]);
  const [mixerVolumes, setMixerVolumes] = useState<number[]>([]);
  const [weeklyShiftsCount, setWeeklyShiftsCount] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.all([
      settingsApi.getCompanyProfile(),
      settingsApi.getSystemSettings(),
      workCalendarApi.getSettings().catch(() => null),
    ])
      .then(([profile, , calendar]) => {
        if (!active) return;

        setName(profile.name || 'شرکت');
        const mixers = profile.batchingMixers || [];
        setMixersCount(mixers.length);
        setMixerLabels(mixers.map((m, i) => m.name || `دیگ ${i + 1}`));
        setMixerVolumes(mixers.map((m) => Number(m.volumeM3) || 0));
        setWeeklyShiftsCount(calendar?.weeklyTemplate?.filter((s) => s.isActive !== false).length || 0);

        const checks = [
          !!profile.name,
          !!profile.phone,
          !!profile.email,
          !!profile.nationalId,
          !!profile.locationAddress,
          mixers.length > 0,
          (calendar?.weeklyTemplate?.length || 0) > 0,
        ];
        setProfileScore(Math.round((checks.filter(Boolean).length / checks.length) * 100));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const completionChart = useMemo(
    () => ({
      categories: ['تکمیل‌شده', 'باقی‌مانده'],
      series: [profileScore, Math.max(0, 100 - profileScore)],
    }),
    [profileScore]
  );

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="نام شرکت" value={name} icon="solar:buildings-3-bold-duotone" color={colors.primary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard
            label="واحد مالی"
            value={FINANCIAL_CURRENCY_OPTIONS.find((x) => x.value === financialCurrencyUnit)?.label || '-'}
            icon="solar:wallet-money-bold-duotone"
            color={colors.chartSecondary}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard
            label="تم رنگی"
            value={TENANT_ACCENT_OPTIONS.find((x) => x.value === accent)?.label || '-'}
            icon="solar:palette-bold-duotone"
            color={colors.primaryDark}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard
            label="شیفت هفتگی"
            value={weeklyShiftsCount}
            icon="solar:calendar-bold-duotone"
            color={colors.chartAccent}
            isDark={isDark}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TenantChartCard
            title="حجم دیگ‌های بچینگ"
            type="bar"
            categories={mixerLabels.length ? mixerLabels : ['بدون دیگ']}
            series={[{ name: 'm³', data: mixerVolumes.length ? mixerVolumes : [0] }]}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <TenantChartCard
            title="درصد تکمیل پروفایل"
            type="donut"
            categories={completionChart.categories}
            series={completionChart.series}
            isDark={isDark}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
