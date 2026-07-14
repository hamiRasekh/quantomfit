'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { RawMaterial } from '@/features/raw-materials/types';
import { materialPurchaseInvoicesApi } from '../api/materialPurchaseInvoicesApi';
import { CreateMaterialPurchaseInvoiceLine } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const emptyLine = (): CreateMaterialPurchaseInvoiceLine => ({
  rawMaterialId: '',
  quantity: 1,
  unitPrice: 0,
});

export function MaterialPurchaseInvoiceFormDialog({ open, onClose, onSuccess }: Props) {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [saving, setSaving] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    invoiceNumber: '',
    party: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    description: '',
    lines: [emptyLine()],
  });

  useEffect(() => {
    if (!open) return;
    rawMaterialsApi.getAll({ limit: 200, isActive: true }).then((r) => setMaterials(r.data || []));
    setForm({
      invoiceNumber: '',
      party: '',
      invoiceDate: new Date().toISOString().slice(0, 10),
      description: '',
      lines: [emptyLine()],
    });
    setInvoiceFile(null);
  }, [open]);

  const updateLine = (index: number, patch: Partial<CreateMaterialPurchaseInvoiceLine>) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  };

  const submit = async () => {
    if (!form.party.trim()) {
      toast.error('تأمین‌کننده الزامی است');
      return;
    }
    if (!form.lines.every((l) => l.rawMaterialId && l.quantity > 0 && l.unitPrice >= 0)) {
      toast.error('همه اقلام باید ماده، مقدار و قیمت داشته باشند');
      return;
    }

    setSaving(true);
    try {
      await materialPurchaseInvoicesApi.create({
        invoiceNumber: form.invoiceNumber.trim() || undefined,
        party: form.party.trim(),
        invoiceDate: form.invoiceDate,
        description: form.description.trim() || undefined,
        lines: form.lines,
        invoiceFile,
      });
      toast.success('فاکتور ورود ثبت شد و در بخش مالی قابل مشاهده است');
      onSuccess();
    } catch (error) {
      notifyApiError(error, 'خطا در ثبت فاکتور ورود');
    } finally {
      setSaving(false);
    }
  };

  const lineTotal = form.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>ثبت فاکتور ورود مواد</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            فاکتور و توضیحات حسابداری اینجا ثبت می‌شود. با ثبت، موجودی انبار و گزارش مالی «فاکتور ورود مواد» به‌روز می‌شود.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="شماره فاکتور"
              value={form.invoiceNumber}
              onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="تأمین‌کننده / طرف حساب *"
              value={form.party}
              onChange={(e) => setForm({ ...form, party: e.target.value })}
              fullWidth
            />
            <TextField
              type="date"
              label="تاریخ فاکتور *"
              InputLabelProps={{ shrink: true }}
              value={form.invoiceDate}
              onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
              fullWidth
            />
          </Stack>

          <TextField
            label="توضیحات حسابداری"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            multiline
            rows={2}
            fullWidth
            placeholder="مثلاً شماره حواله، شرایط پرداخت، یادداشت برای حسابداری"
          />

          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
            }}
          >
            <input
              id="material-invoice-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              hidden
              onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="material-invoice-file">
              <Button component="span" variant="outlined" startIcon={<Iconify icon="solar:upload-bold" />}>
                {invoiceFile ? 'تغییر فایل فاکتور' : 'آپلود تصویر/PDF فاکتور'}
              </Button>
            </label>
            {invoiceFile && (
              <Typography sx={{ mt: 1, fontSize: 13 }}>{invoiceFile.name}</Typography>
            )}
          </Box>

          <Typography sx={{ fontWeight: 700 }}>اقلام فاکتور</Typography>
          {form.lines.map((line, index) => (
            <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <TextField
                select
                label="ماده *"
                value={line.rawMaterialId}
                onChange={(e) => updateLine(index, { rawMaterialId: e.target.value })}
                fullWidth
                size="small"
              >
                {materials.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="مقدار *"
                value={line.quantity}
                onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 100 }}
                inputProps={{ min: 1 }}
              />
              <TextField
                type="number"
                label="قیمت واحد (ریال) *"
                value={line.unitPrice || ''}
                onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })}
                size="small"
                sx={{ minWidth: 140 }}
                inputProps={{ min: 0 }}
              />
              <IconButton
                color="error"
                disabled={form.lines.length <= 1}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    lines: prev.lines.filter((_, i) => i !== index),
                  }))
                }
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Stack>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={() => setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }))}
            sx={{ alignSelf: 'flex-start' }}
          >
            افزودن قلم
          </Button>

          <Typography sx={{ fontWeight: 800 }}>
            جمع فاکتور: {lineTotal.toLocaleString('fa-IR')} ریال
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {saving ? 'در حال ثبت...' : 'ثبت فاکتور'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
