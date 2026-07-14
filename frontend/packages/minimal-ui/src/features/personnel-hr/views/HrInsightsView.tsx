'use client';

import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { personnelHrApi } from '../api/personnelHrApi';
import { HrSummaryReport } from '../types';
import { displayMoney, displayNum } from '../utils/display';

type Props = { isDark: boolean };

export function HrInsightsView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<HrSummaryReport | null>(null);

  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';
  const panelSx = {
    p: 2,
    borderRadius: 3,
    border: isDark ? '1px solid rgba(234,242,255,0.1)' : '1px solid rgba(4,4,74,0.08)',
    bgcolor: isDark ? 'rgba(8,14,28,0.45)' : '#fff',
    height: '100%',
  };

  useEffect(() => {
    personnelHrApi.reports().then(setReport).finally(() => setLoading(false));
  }, []);

  const personnelStats = [
    { label: 'کل پرسنل', value: displayNum(report?.headcount), icon: 'solar:users-group-rounded-bold-duotone' },
    { label: 'فعال', value: displayNum(report?.active), icon: 'solar:user-check-bold-duotone' },
    { label: 'غیرفعال', value: displayNum(report?.inactive), icon: 'solar:user-cross-bold-duotone' },
    { label: 'رانندگان فعال', value: displayNum(report?.drivers), icon: 'solar:bus-bold-duotone' },
  ];

  const opsStats = [
    { label: 'رکورد حضور', value: displayNum(report?.attendanceRecords), icon: 'solar:clock-circle-bold-duotone' },
    { label: 'فیش حقوق ثبت‌شده', value: displayNum(report?.payrollRecordCount), icon: 'solar:wallet-bold-duotone' },
    { label: 'مرخصی در انتظار', value: displayNum(report?.pendingLeave), icon: 'solar:calendar-bold-duotone' },
    { label: 'هشدار باز', value: displayNum(report?.openAlerts), icon: 'solar:danger-bold-duotone' },
  ];

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="گزارش پرسنل"
        subtitle="خلاصه وضعیت نیروی انسانی، حقوق و عملیات روزانه"
        isDark={isDark}
      />

      {loading ? (
        <Stack alignItems="center" py={8}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Stack>
      ) : (
        <>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: isDark ? '1px solid rgba(234,242,255,0.12)' : '1px solid rgba(4,4,74,0.08)',
              background: isDark
                ? `linear-gradient(135deg, ${colors.primary}22 0%, rgba(8,14,28,0.55) 60%)`
                : `linear-gradient(135deg, ${colors.primary}14 0%, #fff 60%)`,
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={0.5}>
                <Typography sx={{ fontSize: 13, color: muted }}>جمع خالص حقوق ثبت‌شده</Typography>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: 26, md: 32 }, color: text }}>
                  {displayMoney(report?.totalPayrollNet)}
                </Typography>
              </Stack>
              <Stack spacing={0.5} sx={{ textAlign: { xs: 'left', sm: 'left' } }}>
                <Typography sx={{ fontSize: 13, color: muted }}>پرسنل فعال</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22, color: text }}>
                  {displayNum(report?.active)} نفر
                </Typography>
              </Stack>
            </Stack>
          </Card>

          <Typography sx={{ fontWeight: 800, color: text }}>پرسنل</Typography>
          <Grid container spacing={2}>
            {personnelStats.map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                <StatCard item={item} panelSx={panelSx} text={text} muted={muted} accent={colors.primary} />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ borderColor: isDark ? 'rgba(234,242,255,0.1)' : undefined }} />

          <Typography sx={{ fontWeight: 800, color: text }}>عملیات و پیگیری</Typography>
          <Grid container spacing={2}>
            {opsStats.map((item) => (
              <Grid key={item.label} size={{ xs: 6, md: 3 }}>
                <StatCard item={item} panelSx={panelSx} text={text} muted={muted} accent={colors.primary} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Stack>
  );
}

function StatCard({
  item,
  panelSx,
  text,
  muted,
  accent,
}: {
  item: { label: string; value: string; icon: string };
  panelSx: object;
  text: string;
  muted: string;
  accent: string;
}) {
  return (
    <Card sx={panelSx}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Iconify icon={item.icon} width={28} sx={{ color: accent, flexShrink: 0 }} />
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, color: muted }}>{item.label}</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: 20, color: text }}>{item.value}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
