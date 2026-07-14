'use client';

import { useEffect, useState } from 'react';

import Stack from '@mui/material/Stack';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { OrderAlertsList } from '../components/OrderAlertsList';
import { OrderAlert } from '../types/sales';

type Props = { isDark: boolean };

export function OrderAlertsView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OrderAlert[]>([]);

  useEffect(() => {
    ordersSalesApi.listAlerts().then(setRows).finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="هشدارهای سفارشات" isDark={isDark} />
      <OrderAlertsList alerts={rows} loading={loading} />
    </Stack>
  );
}
