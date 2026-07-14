'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { FinancialCurrencyUnit } from '@/features/tenant-panel/theme';

import { FinancialExecutiveSummary } from '../types/advanced';
import { formatMoney, formatPercent } from '../utils/format';

type Props = {
  summary: FinancialExecutiveSummary;
  unit: FinancialCurrencyUnit;
  isDark: boolean;
  accent: string;
};

function ExecutiveCard({
  icon,
  title,
  value,
  subtitle,
  breakdown,
  isDark,
  accent,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  breakdown?: Array<{ label: string; value: string; color?: string }>;
  isDark: boolean;
  accent: string;
}) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.58)';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        background: isDark
          ? 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(30,41,59,0.55))'
          : 'linear-gradient(160deg, #ffffff, #f8fafc)',
      }}
    >
      <Stack spacing={1.75} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: `${accent}18`,
              color: accent,
            }}
          >
            <Iconify icon={icon} width={22} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 14, color: muted }}>{title}</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 22, md: 26 }, color: text, lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 12.5, color: muted, lineHeight: 1.7 }}>{subtitle}</Typography>
        {breakdown?.length ? (
          <Stack spacing={0.75} sx={{ mt: 'auto' }}>
            {breakdown.map((item) => (
              <Stack key={item.label} direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: 12.5, color: muted }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: item.color ?? text }}>
                  {item.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

export function FinancialExecutiveKpiRow({ summary, unit, isDark, accent }: Props) {
  const { weeklyRevenue, grossProfit, liquidity } = summary;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ExecutiveCard
          icon="solar:cart-large-2-bold-duotone"
          title="درآمد هفتگی"
          value={formatMoney(weeklyRevenue.total, unit, true)}
          subtitle="مجموع درآمدهای عملیاتی فاکتورشده در ۷ روز اخیر"
          breakdown={[
            { label: 'فروش بتن', value: formatMoney(weeklyRevenue.concrete, unit, true), color: accent },
            { label: 'کرایه حمل', value: formatMoney(weeklyRevenue.transport, unit, true) },
            { label: 'خدمات پمپاژ', value: formatMoney(weeklyRevenue.pumping, unit, true) },
          ]}
          isDark={isDark}
          accent={accent}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ExecutiveCard
          icon="solar:wallet-money-bold-duotone"
          title="سود ناخالص کارخانه"
          value={formatMoney(grossProfit.amount, unit, true)}
          subtitle="درآمد کل − بهای تمام‌شده (مواد + دستمزد + سربار)"
          breakdown={[
            { label: 'درآمد', value: formatMoney(grossProfit.revenue, unit, true) },
            { label: 'بهای تمام‌شده', value: formatMoney(grossProfit.cogs, unit, true) },
            { label: 'حاشیه', value: formatPercent(grossProfit.marginPercent), color: '#16A34A' },
          ]}
          isDark={isDark}
          accent={accent}
        />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ExecutiveCard
          icon="solar:safe-square-bold-duotone"
          title="جریان نقد و مانده"
          value={formatMoney(liquidity.bankBalance + liquidity.cashBalance, unit, true)}
          subtitle="مانده لحظه‌ای صندوق و بانک + جریان ورودی ماه"
          breakdown={[
            { label: 'ورودی ماه', value: formatMoney(liquidity.cashInMonth, unit, true), color: '#16A34A' },
            { label: 'خالص ماه', value: formatMoney(liquidity.netCashMonth, unit, true) },
            { label: 'بانک + صندوق', value: formatMoney(liquidity.bankBalance + liquidity.cashBalance, unit, true) },
          ]}
          isDark={isDark}
          accent={accent}
        />
      </Grid>
    </Grid>
  );
}
