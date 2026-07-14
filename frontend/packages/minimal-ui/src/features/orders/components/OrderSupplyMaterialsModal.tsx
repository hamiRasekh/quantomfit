'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { toast } from 'sonner';

import { stockLedgerApi } from '@/features/stock-ledger/api/stockLedgerApi';
import { StockLedgerType } from '@/features/stock-ledger/types';
import type { OrderMaterialsReportItem } from '@/features/orders/types';

const formatNumber = (value: number) =>
  value.toLocaleString('fa-IR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type RowFormState = {
  quantity: number;
  occurredAt: Date;
  party: string;
  note: string;
  submitting: boolean;
};

const defaultRowForm = (): RowFormState => ({
  quantity: 0,
  occurredAt: new Date(),
  party: '',
  note: '',
  submitting: false,
});

interface OrderSupplyMaterialsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  items: OrderMaterialsReportItem[];
  materialsWithShortage: number;
  allSupplied: boolean;
  materialsConfirmed: boolean;
  onSuccess: () => void;
  onConfirmMaterialsSupplied: () => Promise<void>;
}

export function OrderSupplyMaterialsModal({
  open,
  onClose,
  orderId,
  items,
  materialsWithShortage,
  allSupplied,
  materialsConfirmed,
  onSuccess,
  onConfirmMaterialsSupplied,
}: OrderSupplyMaterialsModalProps) {
  const itemsWithShortage = items.filter((i) => i.shortage > 0);
  const [rowForms, setRowForms] = useState<Record<string, RowFormState>>({});
  const [confirming, setConfirming] = useState(false);

  const getRowForm = (rawMaterialId: string): RowFormState =>
    rowForms[rawMaterialId] ?? defaultRowForm();

  const setRowForm = (rawMaterialId: string, patch: Partial<RowFormState>) => {
    setRowForms((prev) => ({
      ...prev,
      [rawMaterialId]: { ...defaultRowForm(), ...prev[rawMaterialId], ...patch },
    }));
  };

  const handleSubmitEntry = async (item: OrderMaterialsReportItem) => {
    const form = getRowForm(item.rawMaterialId);
    if (form.quantity <= 0) {
      toast.error('مقدار ورود باید بیشتر از صفر باشد');
      return;
    }
    setRowForm(item.rawMaterialId, { submitting: true });
    try {
      await stockLedgerApi.create({
        rawMaterialId: item.rawMaterialId,
        type: StockLedgerType.IN,
        quantity: form.quantity,
        occurredAt: form.occurredAt.toISOString(),
        party: form.party || undefined,
        note: form.note || undefined,
      });
      toast.success(`ورود ${formatNumber(form.quantity)} برای ${item.rawMaterialName} ثبت شد`);
      setRowForm(item.rawMaterialId, defaultRowForm());
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'خطا در ثبت ورود');
    } finally {
      setRowForm(item.rawMaterialId, { submitting: false });
    }
  };

  const handleConfirmSupplied = async () => {
    setConfirming(true);
    try {
      await onConfirmMaterialsSupplied();
      toast.success('تامین مواد توسط ادمین تایید شد');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'خطا در تایید');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>تامین مواد اولیه</DialogTitle>
      <DialogContent>
        {itemsWithShortage.length === 0 && !materialsConfirmed && (
          <Alert severity="success" sx={{ mb: 2 }}>
            همه مواد اولیه به اندازه مورد نیاز موجود است. در صورت تامین فیزیکی، تایید نهایی را بزنید.
          </Alert>
        )}
        {materialsConfirmed && (
          <Alert severity="info" sx={{ mb: 2 }}>
            تامین مواد اولیه برای این سفارش توسط ادمین تایید شده است.
          </Alert>
        )}
        {itemsWithShortage.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {materialsWithShortage} ماده اولیه با کمبود موجودی. برای هر مورد می‌توانید ورود به انبار ثبت کنید.
          </Typography>
        )}

        {itemsWithShortage.map((item) => {
          const form = getRowForm(item.rawMaterialId);
          return (
            <Box
              key={item.rawMaterialId}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {item.rawMaterialName} ({item.rawMaterialCode}) — کمبود: {formatNumber(item.shortage)}{' '}
                {item.unitName}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="مقدار ورود"
                  type="number"
                  size="small"
                  value={form.quantity || ''}
                  onChange={(e) =>
                    setRowForm(item.rawMaterialId, {
                      quantity: Number(e.target.value) || 0,
                    })
                  }
                  inputProps={{ min: 1, step: 1 }}
                  sx={{ width: 120 }}
                />
                <DateTimePicker
                  label="تاریخ و زمان"
                  value={form.occurredAt}
                  onChange={(v) => {
                    const d = v instanceof Date ? v : (v as any)?.toDate?.() ?? (v ? new Date(String(v)) : new Date());
                    setRowForm(item.rawMaterialId, { occurredAt: d });
                  }}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 200 } } }}
                />
                <TextField
                  label="برای / شخص"
                  size="small"
                  value={form.party}
                  onChange={(e) => setRowForm(item.rawMaterialId, { party: e.target.value })}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label="توضیحات"
                  size="small"
                  value={form.note}
                  onChange={(e) => setRowForm(item.rawMaterialId, { note: e.target.value })}
                  sx={{ minWidth: 160 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  disabled={form.quantity <= 0 || form.submitting}
                  onClick={() => handleSubmitEntry(item)}
                >
                  {form.submitting ? 'در حال ثبت...' : 'ثبت ورود'}
                </Button>
              </Box>
            </Box>
          );
        })}

        {allSupplied && !materialsConfirmed && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              موجودی همه مواد اولیه تامین شده است. با زدن دکمه زیر، تامین مواد توسط ادمین تایید می‌شود.
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmSupplied}
              disabled={confirming}
            >
              {confirming ? 'در حال تایید...' : 'تایید تامین مواد توسط ادمین'}
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>بستن</Button>
      </DialogActions>
    </Dialog>
  );
}
