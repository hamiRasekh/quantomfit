'use client';

import { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { toast } from 'sonner';

import { ordersApi } from '@/features/orders/api/ordersApi';
import { OrderStatus, ORDER_STATUS_OPTIONS } from '@/features/orders/types';

interface OrderStatusSelectProps {
  orderId: string;
  value: OrderStatus;
  onSuccess?: () => void;
  size?: 'small' | 'medium';
  label?: string;
  fullWidth?: boolean;
  sx?: object;
}

export function OrderStatusSelect({
  orderId,
  value,
  onSuccess,
  size = 'small',
  label = 'وضعیت',
  fullWidth,
  sx,
}: OrderStatusSelectProps) {
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState<OrderStatus>(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = async (newStatus: OrderStatus) => {
    if (newStatus === currentValue) return;
    setLoading(true);
    try {
      await ordersApi.update(orderId, { status: newStatus });
      setCurrentValue(newStatus);
      toast.success('وضعیت به‌روز شد');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'خطا در تغییر وضعیت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControl size={size} fullWidth={fullWidth} disabled={loading} sx={{ minWidth: 180, ...sx }}>
      <InputLabel id="order-status-label">{label}</InputLabel>
      <Select
        labelId="order-status-label"
        label={label}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
      >
        {ORDER_STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
