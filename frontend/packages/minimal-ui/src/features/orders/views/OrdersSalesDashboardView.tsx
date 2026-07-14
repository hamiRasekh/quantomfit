'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { TenantChartCard } from '@/features/tenant-panel/components/TenantChartCard';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { ORDER_STATUS_LABELS, OrderStatus } from '../types';
import { OrderAlertsSection } from '../components/OrderAlertsList';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { OrderAlert, OrdersDashboard } from '../types/sales';
import { displayM3, displayNum } from '../utils/display';

type Props = { isDark: boolean };

export function OrdersSalesDashboardView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OrdersDashboard | null>(null);
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setAlertsLoading(true);

    Promise.all([ordersSalesApi.getDashboard(), ordersSalesApi.listAlerts()])
      .then(([dashboard, alertRows]) => {
        if (cancelled) return;
        setData(dashboard);
        setAlerts(alertRows);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
        setAlertsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  if (!data) {
    return <Typography sx={{ py: 4, textAlign: 'center' }}>داده‌ای برای نمایش نیست</Typography>;
  }

  const kpis = [
    { label: 'کل سفارشات', value: displayNum(data.totalOrders), icon: 'solar:clipboard-list-bold-duotone' },
    { label: 'فعال', value: displayNum(data.activeOrders), icon: 'solar:play-circle-bold-duotone' },
    { label: 'امروز', value: displayNum(data.todayOrders), icon: 'solar:calendar-bold-duotone' },
    {
      label: 'در انتظار تأیید قیمت',
      value: displayNum(data.pendingFinancialApproval),
      icon: 'solar:wallet-bold-duotone',
      warn: data.pendingFinancialApproval > 0,
    },
    { label: 'هشدار باز', value: displayNum(data.openAlerts), icon: 'solar:danger-bold-duotone', warn: data.openAlerts > 0 },
    { label: 'حجم کل', value: displayM3(data.totalVolumeM3), icon: 'solar:box-bold-duotone' },
  ];

  const statusEntries = Object.entries(data.statusCounts || {});
  const chartCategories = statusEntries.map(([s]) => ORDER_STATUS_LABELS[s as OrderStatus] || s);
  const chartSeries = statusEntries.map(([, c]) => c);

  return (
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="داشبورد سفارشات"
        isDark={isDark}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button component={Link} href={buildTenantHref(basePath, '/orders/new')} variant="contained" sx={{ bgcolor: colors.primary }}>
              سفارش جدید
            </Button>
            <Button component={Link} href={buildTenantHref(basePath, '/orders/list')} variant="outlined">
              لیست
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 6, md: 4 }}>
            <Card sx={{ p: 2, borderRadius: 3, border: `1px solid ${alpha(k.warn ? '#f44336' : colors.primary, 0.2)}` }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon={k.icon} width={28} sx={{ color: colors.primary }} />
                <Stack>
                  <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{k.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{k.value}</Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      {chartCategories.length > 0 && (
        <TenantChartCard
          title="وضعیت سفارشات"
          type="donut"
          categories={chartCategories}
          series={chartSeries}
          isDark={isDark}
        />
      )}

      <OrderAlertsSection alerts={alerts} loading={alertsLoading} />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {[
          { href: '/orders/schedule', label: 'زمان‌بندی' },
          { href: '/orders/payments', label: 'پرداخت‌ها' },
          { href: '/orders/customers', label: 'مشتریان' },
        ].map((l) => (
          <Button key={l.href} component={Link} href={buildTenantHref(basePath, l.href)} variant="outlined" size="small">
            {l.label}
          </Button>
        ))}
      </Stack>
    </Stack>
  );
}
