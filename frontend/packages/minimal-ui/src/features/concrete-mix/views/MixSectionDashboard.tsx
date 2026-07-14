'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from '@/components/ui/iconify';
import { TenantStatCard } from '@/features/tenant-panel/components/TenantStatCard';
import { TenantChartCard } from '@/features/tenant-panel/components/TenantChartCard';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';

import { concreteMixApi } from '../api/concreteMixApi';
import { MIX_MODULE_LABELS } from '../constants';

type Props = { isDark: boolean; basePath: string };

export function MixSectionDashboard({ isDark, basePath }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [byModule, setByModule] = useState<Record<string, number>>({ builder: 0, optimizer: 0, predictor: 0 });
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await concreteMixApi.listRuns({ page: 1, limit: 200 });
        if (!active) return;
        setTotal(res.total || 0);
        const counts = { builder: 0, optimizer: 0, predictor: 0 };
        let done = 0;
        (res.data || []).forEach((run) => {
          counts[run.sourceModule] = (counts[run.sourceModule] || 0) + 1;
          if (run.status === 'completed') done += 1;
        });
        setByModule(counts);
        setCompleted(done);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const moduleChart = useMemo(
    () => ({
      categories: Object.keys(MIX_MODULE_LABELS).map((k) => MIX_MODULE_LABELS[k as keyof typeof MIX_MODULE_LABELS]),
      series: [
        {
          name: 'اجرا',
          data: ['builder', 'optimizer', 'predictor'].map((k) => byModule[k] || 0),
        },
      ],
    }),
    [byModule],
  );

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  const quickLinks = [
    { label: 'سازنده', href: '/concrete-mix/builder', icon: 'solar:settings-bold-duotone' },
    { label: 'بهینه‌ساز', href: '/concrete-mix/optimizer', icon: 'solar:graph-up-bold-duotone' },
    { label: 'نتایج', href: '/concrete-mix/results', icon: 'solar:document-text-bold-duotone' },
    { label: 'پیش‌بینی', href: '/concrete-mix/predictor', icon: 'solar:stars-bold-duotone' },
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="کل اجراها" value={total} icon="solar:calculator-bold-duotone" color={colors.primary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="موفق" value={completed} icon="solar:check-circle-bold-duotone" color={colors.chartSecondary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="سازنده" value={byModule.builder} icon="solar:settings-bold-duotone" color={colors.primaryDark} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard
            label="بهینه + پیش‌بینی"
            value={byModule.optimizer + byModule.predictor}
            icon="solar:chart-2-bold-duotone"
            color={colors.chartAccent}
            isDark={isDark}
          />
        </Grid>
      </Grid>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {quickLinks.map((item) => (
          <Button
            key={item.href}
            component={Link}
            href={buildTenantHref(basePath, item.href)}
            variant="outlined"
            startIcon={<Iconify icon={item.icon} />}
            sx={{ borderColor: `${colors.primary}55`, color: colors.primary, fontWeight: 700 }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TenantChartCard
            title="توزیع اجرا بر اساس بخش"
            type="bar"
            categories={moduleChart.categories}
            series={moduleChart.series}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TenantChartCard
            title="سهم بخش‌ها"
            type="donut"
            categories={moduleChart.categories}
            series={moduleChart.series[0].data}
            isDark={isDark}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
