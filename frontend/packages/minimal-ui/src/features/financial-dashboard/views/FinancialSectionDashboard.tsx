'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

import { financialDashboardApi } from '../api/financialDashboardApi';
import { FinancialExecutiveKpiRow } from '../components/FinancialExecutiveKpiRow';
import { FINANCIAL_HUBS } from '../constants/hubs';
import { FinancialExecutiveSummary } from '../types/advanced';

type Props = { isDark: boolean };

const OPERATIONAL_HUBS = FINANCIAL_HUBS.filter((hub) => hub.id !== 'advanced');

export function FinancialSectionDashboard({ isDark }: Props) {
  const { colors, financialCurrencyUnit } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialExecutiveSummary | null>(null);

  useEffect(() => {
    financialDashboardApi
      .getExecutiveSummary({}, financialCurrencyUnit)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [financialCurrencyUnit]);

  const text = isDark ? LANDING_SHELL.text : '#04044A';
  const muted = isDark ? LANDING_SHELL.textMuted : 'rgba(4,4,74,0.62)';

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="داشبورد مالی"
        subtitle="سه شاخص کلیدی عملیاتی + دسترسی سریع به هاب‌های فروش، بهای تمام‌شده و لجستیک."
        isDark={isDark}
      />

      {summary ? (
        <FinancialExecutiveKpiRow
          summary={summary}
          unit={financialCurrencyUnit}
          isDark={isDark}
          accent={colors.primary}
        />
      ) : null}

      <Stack spacing={1.5}>
        <Typography sx={{ fontWeight: 800, fontSize: 16, color: text }}>هاب‌های عملیاتی</Typography>
        <Typography sx={{ fontSize: 13, color: muted }}>
          مدیریت فروش و اعتبار، بهای تمام‌شده تولید، و لجستیک ناوگان
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {OPERATIONAL_HUBS.map((hub) => (
          <Grid key={hub.id} size={{ xs: 12, md: 4 }}>
            <Button
              component={Link}
              href={buildTenantHref(basePath, hub.path)}
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon={hub.icon} width={22} />}
              sx={{
                py: 2,
                justifyContent: 'flex-start',
                borderRadius: 2.5,
                fontWeight: 800,
                textAlign: 'right',
                flexDirection: 'row-reverse',
                gap: 1.25,
              }}
            >
              {hub.label}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" justifyContent="flex-end">
        <Button
          component={Link}
          href={buildTenantHref(basePath, '/financial/advanced')}
          size="small"
          sx={{ color: muted, fontWeight: 700 }}
          endIcon={<Iconify icon="solar:alt-arrow-left-linear" width={16} />}
        >
          حسابداری ارشد
        </Button>
      </Stack>
    </Stack>
  );
}
