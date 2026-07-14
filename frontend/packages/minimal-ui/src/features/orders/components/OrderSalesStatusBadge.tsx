'use client';

import Chip from '@mui/material/Chip';
import { OrderStatus, ORDER_STATUS_LABELS } from '../types';

const COLORS: Partial<Record<OrderStatus, 'default' | 'success' | 'warning' | 'error' | 'info'>> = {
  [OrderStatus.DRAFT]: 'default',
  [OrderStatus.CONFIRMED]: 'info',
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.IN_PROGRESS]: 'info',
  [OrderStatus.SHIPPED]: 'warning',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'error',
  [OrderStatus.FINANCIAL]: 'warning',
};

type Props = { status: OrderStatus };

export function OrderSalesStatusBadge({ status }: Props) {
  return (
    <Chip
      size="small"
      label={ORDER_STATUS_LABELS[status] || status}
      color={COLORS[status] || 'default'}
      variant="outlined"
    />
  );
}
