'use client';

import { useState } from 'react';

import Stack from '@mui/material/Stack';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { OrderPaymentInvoiceDialog } from '../components/OrderPaymentInvoiceDialog';
import { OrderPaymentsTable } from '../components/OrderPaymentsTable';
import { useOrderPaymentsData } from '../hooks/use-order-payments-data';
import { Order } from '../types';

type Props = { isDark: boolean };

export function OrderPaymentsView({ isDark }: Props) {
  const { loading, orders, payments, reload } = useOrderPaymentsData();
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="پرداخت‌ها" isDark={isDark} />

      <OrderPaymentsTable
        orders={orders}
        payments={payments}
        loading={loading}
        showActions
        onAddInvoice={setInvoiceOrder}
      />

      <OrderPaymentInvoiceDialog
        open={!!invoiceOrder}
        order={invoiceOrder}
        payments={payments}
        onClose={() => setInvoiceOrder(null)}
        onSaved={reload}
      />
    </Stack>
  );
}
