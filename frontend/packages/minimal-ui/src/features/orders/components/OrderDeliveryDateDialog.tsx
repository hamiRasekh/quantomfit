'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { toast } from 'sonner';

import { ordersSalesApi } from '../api/ordersSalesApi';
import { Order } from '../types';
import { displayDateTime } from '../utils/display';

type Props = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSaved: () => void;
};

export function OrderDeliveryDateDialog({ open, order, onClose, onSaved }: Props) {
  const [value, setValue] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order?.deliveryDate) {
      setValue(dayjs(order.deliveryDate));
    } else {
      setValue(null);
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    if (value && value.startOf('day').isBefore(dayjs().startOf('day'))) {
      toast.error('تاریخ تحویل نمی‌تواند قبل از امروز باشد');
      return;
    }
    setSaving(true);
    try {
      await ordersSalesApi.updateFields(order.id, {
        deliveryDate: value ? value.toISOString() : '',
      });
      toast.success(value ? 'تاریخ تحویل ثبت شد' : 'تاریخ تحویل حذف شد');
      onSaved();
      onClose();
    } catch {
      toast.error('خطا در ثبت تاریخ تحویل');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>تاریخ و ساعت تحویل — {order?.orderNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            تاریخ فعلی: {displayDateTime(order?.deliveryDate)}
          </Typography>
          <DateTimePicker
            label="تاریخ و ساعت تحویل"
            value={value}
            minDate={dayjs().startOf('day').toDate()}
            onChange={(next) => setValue(next ? dayjs(next) : null)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {order?.deliveryDate ? (
          <Button color="warning" onClick={() => setValue(null)} disabled={saving}>
            حذف تاریخ
          </Button>
        ) : null}
        <Button onClick={onClose} disabled={saving}>
          انصراف
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'در حال ثبت...' : 'ذخیره'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
