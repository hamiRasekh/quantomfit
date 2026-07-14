'use client';

import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { displayNum } from '../utils/display';

type Props = { isDark: boolean };

export function OrderReportsView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ total?: number; revenue?: number; byStatus?: Record<string, number> } | null>(null);

  useEffect(() => {
    ordersSalesApi
      .reportsSummary()
      .then((r) => setData(r as { total?: number; revenue?: number; byStatus?: Record<string, number> }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="گزارشات سفارشات" isDark={isDark} />
      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : (
        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography>تعداد کل: {displayNum(data?.total)}</Typography>
          <Typography>درآمد ثبت‌شده: {displayNum(data?.revenue)}</Typography>
          {data?.byStatus &&
            Object.entries(data.byStatus).map(([k, v]) => (
              <Typography key={k} sx={{ fontSize: 13 }}>{k}: {displayNum(v)}</Typography>
            ))}
        </Card>
      )}
    </Stack>
  );
}
