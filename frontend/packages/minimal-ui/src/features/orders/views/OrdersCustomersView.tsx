'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { customersApi } from '@/features/customers/api/customersApi';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { customersCrmApi } from '../api/ordersSalesApi';
import { displayMoney, displayNum } from '../utils/display';

type Props = { isDark: boolean };

export function OrdersCustomersView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Array<{ id: string; name?: string; title?: string; mobile?: string; balance: number }>>([]);
  const [reports, setReports] = useState<{
    topBuyers?: Array<{ name: string; totalAmount: number }>;
    debtors?: Array<{ name: string; balance: number }>;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      customersApi.getAll({ page: 1, limit: 100 }),
      customersCrmApi.reports(),
    ])
      .then(([c, r]) => {
        setCustomers(c.data || []);
        setReports(r as typeof reports);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title="مشتریان"
        isDark={isDark}
        action={
          <Button component={Link} href={buildTenantHref(basePath, '/orders/customers/new')} variant="contained">
            مشتری جدید
          </Button>
        }
      />

      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : (
        <>
          {reports?.debtors && reports.debtors.length > 0 && (
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>بدهکاران</Typography>
              {reports.debtors.slice(0, 5).map((d, i) => (
                <Typography key={i} sx={{ fontSize: 13 }}>{d.name}: {displayMoney(d.balance)}</Typography>
              ))}
            </Card>
          )}

          {customers.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>مشتری ثبت نشده</Typography>
          ) : (
            customers.map((c) => (
              <Card key={c.id} sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Typography sx={{ fontWeight: 800 }}>{c.name || c.title || '—'}</Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.7 }}>{c.mobile || '—'} | مانده: {displayMoney(c.balance)}</Typography>
                  </Stack>
                  <Button component={Link} href={buildTenantHref(basePath, `/orders/customers/${c.id}`)} size="small" variant="outlined">
                    پروفایل
                  </Button>
                </Stack>
              </Card>
            ))
          )}
        </>
      )}
    </Stack>
  );
}
