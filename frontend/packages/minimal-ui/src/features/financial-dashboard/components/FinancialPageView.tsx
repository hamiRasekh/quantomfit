'use client';

import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { TenantChartCard } from '@/features/tenant-panel/components/TenantChartCard';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { useFinancialPage } from '../hooks/useFinancialPage';
import { FinancialPageId } from '../types';
import { FinancialAlertsPanel } from './FinancialAlertsPanel';
import { FinancialDataTable } from './FinancialDataTable';
import { FinancialFilterBar } from './FinancialFilterBar';
import { FinancialKpiGrid } from './FinancialKpiGrid';

type Props = {
  pageId: FinancialPageId;
  isDark: boolean;
  variant?: 'hub' | 'detail';
};

export function FinancialPageView({ pageId, isDark, variant = 'detail' }: Props) {
  const { colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const { filters, setFilters, loading, error, data, refresh } = useFinancialPage(pageId);

  if (loading && !data) {
    return (
      <Stack alignItems="center" py={10}>
        <CircularProgress sx={{ color: colors.primary }} />
        <Typography sx={{ mt: 2, opacity: 0.7 }}>در حال بارگذاری گزارش مالی…</Typography>
      </Stack>
    );
  }

  if (error && !data) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={refresh} sx={{ alignSelf: 'flex-start', bgcolor: colors.primary }}>
          تلاش مجدد
        </Button>
      </Stack>
    );
  }

  if (!data) {
    return <Alert severity="info">داده‌ای برای نمایش موجود نیست.</Alert>;
  }

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title={data.title}
        isDark={isDark}
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={refresh}
            disabled={loading}
            startIcon={<Iconify icon="solar:refresh-bold-duotone" width={18} />}
            sx={{ borderColor: `${colors.primary}55`, color: colors.primary }}
          >
            بروزرسانی
          </Button>
        }
      />

      <Typography sx={{ fontSize: 13.5, opacity: 0.75, mt: -1 }}>{data.description}</Typography>

      <FinancialFilterBar filters={filters} onChange={setFilters} isDark={isDark} />

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={20} />
          <Typography sx={{ fontSize: 13 }}>به‌روزرسانی…</Typography>
        </Stack>
      ) : null}

      {variant === 'detail' ? <FinancialKpiGrid kpis={data.kpis} isDark={isDark} accent={colors.primary} /> : null}

      {variant === 'detail' && data.alerts.length > 0 && pageId !== 'alerts' ? (
        <FinancialAlertsPanel alerts={data.alerts.slice(0, 4)} isDark={isDark} />
      ) : null}

      {variant === 'detail' && data.charts.length > 0 && (
        <Grid container spacing={2}>
          {data.charts.map((chart) => (
            <Grid key={chart.id} size={{ xs: 12, lg: data.charts.length === 1 ? 12 : 6 }}>
              <TenantChartCard
                title={chart.title}
                subtitle={chart.subtitle}
                type={chart.type}
                categories={chart.categories}
                series={chart.series}
                isDark={isDark}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {data.tables.map((table) => (
        <FinancialDataTable
          key={table.id}
          title={table.title}
          columns={table.columns}
          rows={table.rows}
          isDark={isDark}
        />
      ))}

      {pageId === 'alerts' && data.alerts.length > 0 ? (
        <FinancialAlertsPanel alerts={data.alerts} isDark={isDark} />
      ) : null}

      {pageId !== 'alerts' ? (
        <Button
          component={Link}
          href={buildTenantHref(basePath, '/financial/alerts')}
          variant="text"
          size="small"
          startIcon={<Iconify icon="solar:danger-bold-duotone" />}
          sx={{ alignSelf: 'flex-start', color: colors.primary }}
        >
          مشاهده همه هشدارها
        </Button>
      ) : null}
    </Stack>
  );
}
