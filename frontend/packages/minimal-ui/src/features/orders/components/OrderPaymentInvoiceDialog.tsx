'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { ordersSalesApi } from '../api/ordersSalesApi';
import { Order } from '../types';
import { OrderPayment, OrderPaymentType } from '../types/sales';
import { displayMoney } from '../utils/display';
import { defaultInvoiceAmount, depositStatusLabel } from '../utils/order-payments';

type Props = {
  open: boolean;
  order: Order | null;
  payments: OrderPayment[];
  onClose: () => void;
  onSaved: () => void;
};

const PAYMENT_TYPES: { value: OrderPaymentType; label: string }[] = [
  { value: 'PREPAYMENT', label: 'پیش‌پرداخت' },
  { value: 'INSTALLMENT', label: 'قسط' },
  { value: 'FINAL', label: 'تسویه نهایی' },
];

export function OrderPaymentInvoiceDialog({ open, order, payments, onClose, onSaved }: Props) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<OrderPaymentType>('PREPAYMENT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [depositStatus, setDepositStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const orderPayments = useMemo(
    () => payments.filter((p) => p.orderId === order?.id),
    [payments, order?.id],
  );

  useEffect(() => {
    if (!order || !open) return;
    const suggested = defaultInvoiceAmount(order);
    setAmount(suggested > 0 ? String(suggested) : '');
    setType(order.prepaymentRequired ? 'PREPAYMENT' : 'FINAL');
    setReferenceNumber('');
    setNotes('');
    setDepositStatus(
      depositStatusLabel(order, orderPayments) === 'پرداخت شده' ? 'PAID' : 'UNPAID',
    );
  }, [order, open, orderPayments]);

  const handleSave = async () => {
    if (!order) return;
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error('مبلغ فاکتور باید بزرگ‌تر از صفر باشد');
      return;
    }

    setSaving(true);
    try {
      await ordersSalesApi.createPayment({
        orderId: order.id,
        type,
        amount: Math.round(parsedAmount),
        status: depositStatus === 'PAID' ? 'APPROVED' : 'PENDING',
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success('فاکتور پرداخت ثبت شد');
      onSaved();
      onClose();
    } catch {
      toast.error('خطا در ثبت فاکتور پرداخت');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePayment = async (payment: OrderPayment, paid: boolean) => {
    setTogglingId(payment.id);
    try {
      if (paid) {
        await ordersSalesApi.approvePayment(payment.id);
        toast.success('وضعیت واریز به «پرداخت شده» تغییر کرد');
      } else {
        await ordersSalesApi.rejectPayment(payment.id);
        toast.success('وضعیت واریز به «پرداخت نشده» تغییر کرد');
      }
      onSaved();
    } catch {
      toast.error('خطا در تغییر وضعیت واریز');
    } finally {
      setTogglingId(null);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>افزودن فاکتور پرداخت — {order.orderNumber}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {order.title || order.destinationTitle || 'بدون عنوان'} — مبلغ سفارش:{' '}
            {displayMoney(order.totalAmount)}
          </Typography>

          {orderPayments.length > 0 && (
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>فاکتورهای ثبت‌شده</Typography>
              {orderPayments.map((p) => (
                <Stack
                  key={p.id}
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  spacing={1}
                  sx={{ p: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{displayMoney(p.amount)}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {p.type} — {p.status === 'APPROVED' ? 'پرداخت شده' : 'پرداخت نشده'}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    {p.status !== 'APPROVED' && (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={togglingId === p.id}
                        onClick={() => handleTogglePayment(p, true)}
                      >
                        واریز شد
                      </Button>
                    )}
                    {p.status === 'APPROVED' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        disabled={togglingId === p.id}
                        onClick={() => handleTogglePayment(p, false)}
                      >
                        واریز نشد
                      </Button>
                    )}
                  </Stack>
                </Stack>
              ))}
              <Divider />
            </Stack>
          )}

          <TextField
            label="مبلغ فاکتور (ریال)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 1, step: 1000 }}
          />
          <TextField select label="نوع پرداخت" fullWidth value={type} onChange={(e) => setType(e.target.value as OrderPaymentType)}>
            {PAYMENT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="وضعیت واریز"
            fullWidth
            value={depositStatus}
            onChange={(e) => setDepositStatus(e.target.value as 'PAID' | 'UNPAID')}
          >
            <MenuItem value="PAID">پرداخت شده</MenuItem>
            <MenuItem value="UNPAID">پرداخت نشده</MenuItem>
          </TextField>
          <TextField
            label="شماره پیگیری / مرجع (اختیاری)"
            fullWidth
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
          <TextField
            label="توضیحات (اختیاری)"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'در حال ذخیره...' : 'ثبت فاکتور'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
