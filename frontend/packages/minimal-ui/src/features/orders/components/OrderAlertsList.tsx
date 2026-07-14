'use client';

import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { OrderAlert } from '../types/sales';

type Props = {
  alerts: OrderAlert[];
  loading?: boolean;
};

export function OrderAlertsList({ alerts, loading }: Props) {
  const basePath = useTenantBasePath();

  if (loading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (alerts.length === 0) {
    return <Alert severity="success">هشدار بازی وجود ندارد</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      {alerts.map((a) => (
        <Alert key={a.id} severity={a.severity === 'CRITICAL' ? 'error' : 'warning'}>
          <strong>{a.title}</strong> — {a.description}
          {a.orderId && (
            <Button
              component={Link}
              href={buildTenantHref(basePath, `/orders/${a.orderId}`)}
              size="small"
              sx={{ ml: 1 }}
            >
              مشاهده سفارش
            </Button>
          )}
        </Alert>
      ))}
    </Stack>
  );
}

export function OrderAlertsSection({ alerts, loading }: Props) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3 }}>
      <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 1.5 }}>هشدارها</Typography>
      <OrderAlertsList alerts={alerts} loading={loading} />
    </Card>
  );
}
