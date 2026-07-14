'use client';

import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { OrderPaymentsTable } from '@/features/orders/components/OrderPaymentsTable';
import { useOrderPaymentsData } from '@/features/orders/hooks/use-order-payments-data';
import {
  countUnpaidOrders,
  totalCollectedAmount,
  totalOrderRevenue,
  totalOutstandingAmount,
  weeklyCollectedAmount,
} from '@/features/orders/utils/order-payments';
import { displayMoney, displayNum } from '@/features/orders/utils/display';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

type Props = { isDark: boolean; customerId?: string };

export function FinancialOrderPaymentsReportView({ isDark, customerId }: Props) {
  const { colors } = useTenantPageTheme();
  const { loading, orders, payments } = useOrderPaymentsData();

  const scopedOrders = useMemo(
    () => (customerId ? orders.filter((o) => o.customerId === customerId) : orders),
    [orders, customerId],
  );
  const scopedPayments = useMemo(
    () =>
      customerId
        ? payments.filter((p) => scopedOrders.some((o) => o.id === p.orderId))
        : payments,
    [payments, customerId, scopedOrders],
  );

  const summary = useMemo(
    () => ({
      totalOrders: scopedOrders.length,
      totalRevenue: totalOrderRevenue(scopedOrders),
      collected: totalCollectedAmount(scopedOrders),
      outstanding: totalOutstandingAmount(scopedOrders),
      weeklyCollected: weeklyCollectedAmount(scopedPayments),
      unpaidCount: countUnpaidOrders(scopedOrders, scopedPayments),
    }),
    [scopedOrders, scopedPayments],
  );

  const kpis = [
    { label: 'تعداد سفارشات', value: displayNum(summary.totalOrders), icon: 'solar:clipboard-list-bold-duotone' },
    { label: 'درآمد ثبت‌شده', value: displayMoney(summary.totalRevenue), icon: 'solar:cart-large-2-bold-duotone' },
    { label: 'وصول‌شده', value: displayMoney(summary.collected), icon: 'solar:wallet-check-bold-duotone' },
    { label: 'معوق / وصول‌نشده', value: displayMoney(summary.outstanding), icon: 'solar:wallet-money-bold-duotone', warn: summary.outstanding > 0 },
    { label: 'درآمد هفتگی (وصول)', value: displayMoney(summary.weeklyCollected), icon: 'solar:calendar-bold-duotone' },
    { label: 'سفارش بدون واریز', value: displayNum(summary.unpaidCount), icon: 'solar:danger-bold-duotone', warn: summary.unpaidCount > 0 },
  ];

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="گزارش پرداخت سفارشات"
        subtitle="خلاصه مالی و وضعیت واریز سفارشات — بر اساس فاکتورها و وضعیت پرداخت ثبت‌شده در بخش فروش"
        isDark={isDark}
      />

      <Grid container spacing={2}>
        {kpis.map((k) => (
          <Grid key={k.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                border: `1px solid ${alpha(k.warn ? '#f44336' : colors.primary, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon={k.icon} width={26} sx={{ color: colors.primary }} />
                <Stack>
                  <Typography sx={{ fontSize: 12, opacity: 0.7 }}>{k.label}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{k.value}</Typography>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <OrderPaymentsTable orders={scopedOrders} payments={scopedPayments} loading={loading} />
    </Stack>
  );
}
