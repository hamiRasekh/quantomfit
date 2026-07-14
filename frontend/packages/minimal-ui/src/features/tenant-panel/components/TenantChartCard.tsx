'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Chart, useChart } from '@/components/ui/chart';
import { useTenantPageTheme } from '../context/tenant-theme-context';

type SeriesItem = { name?: string; data: number[] };

type Props = {
  title: string;
  subtitle?: string;
  type: 'bar' | 'area' | 'line' | 'donut';
  categories: string[];
  series: SeriesItem[] | number[];
  isDark: boolean;
  height?: number;
};

export function TenantChartCard({
  title,
  subtitle,
  type,
  categories,
  series,
  isDark,
  height = 300,
}: Props) {
  const theme = useTheme();
  const { colors: shellColors, accent } = useTenantPageTheme();
  const palette = [shellColors.chartPrimary, shellColors.chartSecondary, shellColors.chartAccent, shellColors.primaryLight, shellColors.primary];

  const chartTextPrimary = isDark ? '#EAF2FF' : '#04044A';
  const chartTextSecondary = isDark ? '#C9DCFF' : '#4B5E7E';
  const safeCategories = Array.isArray(categories) ? categories : [];

  const chartOptions = useChart({
    colors: palette,
    chart: {
      toolbar: { show: false },
      fontFamily: theme.typography.fontFamily,
      foreColor: chartTextSecondary,
    },
    grid: {
      borderColor: isDark ? alpha('#94B6FF', 0.18) : alpha('#04044A', 0.08),
    },
    xaxis: {
      categories: safeCategories,
      labels: { style: { colors: chartTextSecondary } },
      axisBorder: { color: isDark ? alpha('#94B6FF', 0.2) : alpha('#04044A', 0.12) },
      axisTicks: { color: isDark ? alpha('#94B6FF', 0.2) : alpha('#04044A', 0.12) },
    },
    yaxis: {
      labels: { style: { colors: chartTextSecondary } },
    },
    legend: {
      labels: { colors: chartTextPrimary },
    },
    tooltip: { theme: isDark ? 'dark' : 'light' },
    stroke: type === 'bar' ? { width: 0 } : { curve: 'smooth', width: 2.5 },
    plotOptions: {
      ...(type === 'bar' && { bar: { borderRadius: 6, columnWidth: '46%' } }),
      ...(type === 'donut' && {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: { color: chartTextSecondary },
              value: { color: chartTextPrimary, fontWeight: 700 },
              total: {
                show: true,
                label: 'Total',
                color: chartTextSecondary,
                fontWeight: 600,
              },
            },
          },
        },
      }),
    },
    labels: type === 'donut' ? safeCategories : undefined,
  });

  const chartSeries =
    type === 'donut'
      ? Array.isArray(series)
        ? (series as number[])
        : []
      : Array.isArray(series)
        ? (series as SeriesItem[])
        : [];

  return (
    <Card sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 900, fontSize: 17, color: isDark ? '#EAF2FF' : '#04044A' }}>{title}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 13, color: isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)' }}>
            {subtitle}
          </Typography>
        )}
      </Stack>
      <Chart key={`${type}-${isDark ? 'dark' : 'light'}-${accent}`} type={type} series={chartSeries} options={chartOptions} sx={{ height }} />
    </Card>
  );
}
