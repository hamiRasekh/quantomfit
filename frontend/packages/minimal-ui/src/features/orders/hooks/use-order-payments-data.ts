'use client';

import { useCallback, useEffect, useState } from 'react';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { ordersApi } from '../api/ordersApi';
import { ordersSalesApi } from '../api/ordersSalesApi';
import { Order } from '../types';
import { OrderPayment } from '../types/sales';

export function useOrderPaymentsData() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<OrderPayment[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([
      ordersApi.getAll({ page: 1, limit: 200 }),
      ordersSalesApi.listPayments(),
    ])
      .then(([ordersRes, paymentRows]) => {
        const rows = [...(ordersRes.data || [])].sort(
          (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
        );
        setOrders(rows);
        setPayments(paymentRows);
      })
      .catch((error) => notifyApiError(error, 'خطا در بارگذاری داده‌های پرداخت'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, orders, payments, reload: load };
}
