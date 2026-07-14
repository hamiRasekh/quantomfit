'use client';

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { financialDashboardApi } from '@/features/financial-dashboard/api/financialDashboardApi';
import { TenantChartCard } from '../TenantChartCard';

type Props = {
  isDark: boolean;
};

export function DashboardProfitTrend({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profitByMonth, setProfitByMonth] = useState<Array<{ label: string; profit: number }>>([]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const aggregate = await financialDashboardApi.getAggregate({});
        if (!active) return;
        setProfitByMonth(aggregate.profitByMonth ?? []);
        setError(false);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const chartData = useMemo(
    () => ({
      categories: profitByMonth.map((item) => item.label),
      series: [{ name: 'سود', data: profitByMonth.map((item) => item.profit / 1_000_000) }],
    }),
    [profitByMonth]
  );

  if (loading) {
    return <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3 }} />;
  }

  return (
    <Stack spacing={1.5}>
      {error && (
        <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
          روند سود بارگذاری نشد. لطفاً بعداً دوباره تلاش کنید.
        </Alert>
      )}

      <TenantChartCard
        title="روند سود"
        subtitle="سود ناخالص ماهانه (میلیون تومان)"
        type="area"
        categories={chartData.categories.length ? chartData.categories : ['بدون داده']}
        series={chartData.series[0].data.length ? chartData.series : [{ name: 'سود', data: [0] }]}
        isDark={isDark}
        height={320}
      />
    </Stack>
  );
}
