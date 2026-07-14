'use client';

import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { OrderSchedule } from '../types/sales';
import { displayDateTime, displayM3 } from '../utils/display';

type Props = { isDark: boolean };

export function OrderScheduleView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OrderSchedule[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    ordersSalesApi.listSchedules(today).then(setRows).finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="زمان‌بندی سفارشات" isDark={isDark} />
      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : rows.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>برنامه‌ای ثبت نشده</Typography>
      ) : (
        rows.map((s) => (
          <Card key={s.id} sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>{s.order?.orderNumber || s.orderId}</Typography>
            <Typography sx={{ fontSize: 13 }}>{displayDateTime(s.scheduledStartAt)} | {displayM3(s.plannedVolumeM3)} | کارخانه: {s.plantId || '—'}</Typography>
          </Card>
        ))
      )}
    </Stack>
  );
}
