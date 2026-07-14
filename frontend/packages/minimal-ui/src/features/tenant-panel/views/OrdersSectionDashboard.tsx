'use client';

import { useEffect, useMemo, useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { ordersApi } from '@/features/orders/api/ordersApi';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/features/orders/types';

import { TenantStatCard } from '../components/TenantStatCard';
import { TenantChartCard } from '../components/TenantChartCard';
import { useTenantPageTheme } from '../context/tenant-theme-context';

type Props = { isDark: boolean };

export function OrdersSectionDashboard({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [cancelled, setCancelled] = useState(0);
  const [statusMap, setStatusMap] = useState<Record<string, number>>({});
  const [monthly, setMonthly] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await ordersApi.getAll({ page: 1, limit: 120 });
        if (!mounted) return;

        const rows = response?.data || [];
        setTotal(response?.total || rows.length);

        const counts: Record<string, number> = {};
        const monthBuckets = [0, 0, 0, 0, 0, 0];

        rows.forEach((order) => {
          counts[order.status] = (counts[order.status] || 0) + 1;
          const monthIndex = new Date(order.orderDate).getMonth() % 6;
          monthBuckets[monthIndex] += 1;
        });

        setStatusMap(counts);
        setMonthly(monthBuckets);
        setCompleted(counts[OrderStatus.COMPLETED] || counts[OrderStatus.DELIVERED] || 0);
        setCancelled(counts[OrderStatus.CANCELLED] || 0);
        setActive(
          rows.filter(
            (o) =>
              o.status !== OrderStatus.COMPLETED &&
              o.status !== OrderStatus.DELIVERED &&
              o.status !== OrderStatus.CANCELLED
          ).length
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statusChart = useMemo(() => {
    const entries = Object.entries(statusMap);
    return {
      categories: entries.map(([s]) => ORDER_STATUS_LABELS[s as OrderStatus] || s),
      series: entries.map(([, c]) => c),
    };
  }, [statusMap]);

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
          <TenantStatCard label="کل سفارش‌ها" value={total} icon="solar:clipboard-list-bold-duotone" color={colors.primary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="فعال" value={active} icon="solar:clock-circle-bold-duotone" color={colors.chartSecondary} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="تکمیل‌شده" value={completed} icon="solar:check-circle-bold-duotone" color={colors.primaryDark} isDark={isDark} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TenantStatCard label="لغوشده" value={cancelled} icon="solar:close-circle-bold-duotone" color={colors.chartAccent} isDark={isDark} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <TenantChartCard
            title="روند ثبت سفارش (۶ ماه اخیر)"
            type="area"
            categories={['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور']}
            series={[{ name: 'سفارش', data: monthly }]}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <TenantChartCard
            title="وضعیت سفارشات"
            type="donut"
            categories={statusChart.categories.length ? statusChart.categories : ['بدون داده']}
            series={statusChart.series.length ? statusChart.series : [1]}
            isDark={isDark}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TenantChartCard
            title="مقایسه وضعیت‌ها"
            type="bar"
            categories={statusChart.categories.length ? statusChart.categories : ['بدون داده']}
            series={[{ name: 'تعداد', data: statusChart.series.length ? statusChart.series : [0] }]}
            isDark={isDark}
            height={280}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
