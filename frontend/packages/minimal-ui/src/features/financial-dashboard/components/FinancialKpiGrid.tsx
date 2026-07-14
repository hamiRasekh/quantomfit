'use client';

import Grid from '@mui/material/Grid';

import { TenantStatCard } from '@/features/tenant-panel/components/TenantStatCard';

import { FinancialKpi } from '../types';

type Props = {
  kpis: FinancialKpi[];
  isDark: boolean;
  accent: string;
};

export function FinancialKpiGrid({ kpis, isDark, accent }: Props) {
  if (!kpis.length) return null;

  const col = kpis.length > 8 ? { xs: 12, sm: 6, md: 4, lg: 3 } : { xs: 12, sm: 6, md: 4 };

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi, index) => (
        <Grid key={kpi.id} size={col}>
          <TenantStatCard
            label={kpi.label}
            value={kpi.value}
            hint={
              kpi.hint ||
              (kpi.trend != null
                ? `${kpi.trend > 0 ? '+' : ''}${kpi.trend}% نسبت به دوره قبل`
                : undefined)
            }
            icon={kpi.icon || 'solar:chart-2-bold-duotone'}
            color={
              kpi.severity === 'danger'
                ? '#DC2626'
                : kpi.severity === 'warning'
                  ? '#EA580C'
                  : kpi.severity === 'success'
                    ? '#16A34A'
                    : [accent, '#2563EB', '#0B3C9D', '#8B5CF6'][index % 4]
            }
            isDark={isDark}
          />
        </Grid>
      ))}
    </Grid>
  );
}
