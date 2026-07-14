'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { ordersApi } from '../api/ordersApi';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { Order } from '../types';
import { displayMoney } from '../utils/display';

type Props = { isDark: boolean };

export function OrderFinancialView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Order[]>([]);

  const load = () =>
    ordersApi.getAll({ page: 1, limit: 100 }).then((r) => {
      setRows(
        (r.data || []).filter((o) => o.financialApprovalRequired && !o.financialApprovedAt),
      );
    }).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="تأیید مالی سفارشات" isDark={isDark} />
      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : rows.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>سفارشی در انتظار تأیید مالی نیست</Typography>
      ) : (
        rows.map((o) => (
          <Card key={o.id} sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>{o.orderNumber} — {displayMoney(o.totalAmount)}</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={async () => {
                  await ordersSalesApi.financialApprove(o.id);
                  toast.success('تأیید شد');
                  load();
                }}>تأیید</Button>
                <Button component={Link} href={buildTenantHref(basePath, `/orders/${o.id}`)} size="small">جزئیات</Button>
              </Stack>
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}
