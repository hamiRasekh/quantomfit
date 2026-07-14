'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { customersCrmApi } from '../api/ordersSalesApi';
import { CustomerCrmProfile } from '../types/sales';
import { displayDate, displayM3, displayMoney, displayNum } from '../utils/display';

type Props = { customerId: string; isDark: boolean };

export function OrderCustomerProfileView({ customerId, isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerCrmProfile | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    customersCrmApi.profile(customerId).then(setData).finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <Stack alignItems="center" py={8}><CircularProgress /></Stack>;
  }

  if (!data) return <Alert severity="error">مشتری یافت نشد</Alert>;

  const name = `${data.customer.name || ''} ${data.customer.lastname || ''}`.trim() || data.customer.title;

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title={`پروفایل: ${name}`} isDark={isDark} />

      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography>سفارشات: {displayNum(data.stats.orderCount)}</Typography>
        <Typography>حجم کل: {displayM3(data.stats.totalVolumeM3)}</Typography>
        <Typography>مبلغ کل: {displayMoney(data.stats.totalAmount)}</Typography>
        <Typography>مانده: {displayMoney(data.stats.balance)} | سقف اعتبار: {displayMoney(data.stats.creditLimit)}</Typography>
      </Card>

      <Typography sx={{ fontWeight: 800 }}>تاریخچه سفارشات</Typography>
      {data.orders.length === 0 ? (
        <Typography sx={{ opacity: 0.7 }}>سفارشی ندارد</Typography>
      ) : (
        data.orders.map((o) => (
          <Card key={o.id} sx={{ p: 2, borderRadius: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>{o.orderNumber}</Typography>
            <Typography sx={{ fontSize: 13 }}>{displayDate(o.orderDate)} | {displayMoney(o.totalAmount)}</Typography>
          </Card>
        ))
      )}

      <Typography sx={{ fontWeight: 800 }}>پیگیری‌ها</Typography>
      {data.followUps.map((f) => (
        <Card key={f.id} sx={{ p: 1.5, borderRadius: 2 }}>
          <Typography sx={{ fontSize: 13 }}>{f.type} — {displayDate(f.scheduledAt)} — {f.status}</Typography>
        </Card>
      ))}
    </Stack>
  );
}
