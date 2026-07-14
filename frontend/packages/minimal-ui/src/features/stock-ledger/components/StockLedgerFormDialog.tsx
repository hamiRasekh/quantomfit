'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import {
  Form,
  FormProvider,
  RHFSelect,
  RHFNumberInput,
  RHFTextField,
  RHFDateTimePicker,
} from '@/components/ui/hook-form';
import MenuItem from '@mui/material/MenuItem';

import dayjs from 'dayjs';

import { toIsoStringFromPickerValue } from '@/lib/utils/date-helpers';
import { stockLedgerApi } from '../api/stockLedgerApi';
import { CreateLedgerEntryDto, StockLedgerType } from '../types';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { RawMaterial } from '@/features/raw-materials/types';

// ----------------------------------------------------------------------

const StockLedgerFormSchema = z
  .object({
    type: z.nativeEnum(StockLedgerType),
    rawMaterialId: z.string().min(1, 'ماده اولیه الزامی است'),
    quantity: z.number().int().min(1, 'مقدار باید عدد صحیح و حداقل ۱ باشد'),
    unitPrice: z.number().min(0).optional(),
    occurredAt: z
      .union([z.string(), z.date()])
      .refine((val) => dayjs(val).isValid(), { message: 'تاریخ و زمان نامعتبر است' }),
    party: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === StockLedgerType.IN && (data.unitPrice == null || data.unitPrice <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'قیمت خرید واحد برای ورود انبار الزامی است',
        path: ['unitPrice'],
      });
    }
  });

type StockLedgerFormValues = z.infer<typeof StockLedgerFormSchema>;

// ----------------------------------------------------------------------

interface StockLedgerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rawMaterialId?: string;
}

export function StockLedgerFormDialog({
  open,
  onClose,
  onSuccess,
  rawMaterialId,
}: StockLedgerFormDialogProps) {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  const methods = useForm<StockLedgerFormValues>({
    resolver: zodResolver(StockLedgerFormSchema),
    defaultValues: {
      type: StockLedgerType.IN,
      rawMaterialId: rawMaterialId || '',
      quantity: 0,
      unitPrice: 0,
      occurredAt: new Date().toISOString(),
      party: '',
      note: '',
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
    reset,
  } = methods;

  const entryType = watch('type');
  const isOut = entryType === StockLedgerType.OUT;

  useEffect(() => {
    if (open) {
      const fetchMaterials = async () => {
        try {
          const response = await rawMaterialsApi.getAll({ limit: 100, isActive: true });
          setRawMaterials(response.data);
        } catch {
          // silent
        }
      };
      fetchMaterials();
      reset({
        type: StockLedgerType.IN,
        rawMaterialId: rawMaterialId || '',
        quantity: 0,
        unitPrice: 0,
        occurredAt: new Date().toISOString(),
        party: '',
        note: '',
      });
    }
  }, [open, reset, rawMaterialId]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);
      const dto: CreateLedgerEntryDto = {
        rawMaterialId: data.rawMaterialId,
        type: data.type,
        quantity: data.quantity,
        unitPrice: data.type === StockLedgerType.IN ? data.unitPrice : undefined,
        occurredAt: toIsoStringFromPickerValue(data.occurredAt) ?? new Date().toISOString(),
        party: data.party || undefined,
        note: data.note || undefined,
      };
      await stockLedgerApi.create(dto);
      toast.success(isOut ? 'خروج انبار با موفقیت ثبت شد' : 'ورود انبار با موفقیت ثبت شد');
      onSuccess();
    } catch (error: unknown) {
      notifyApiError(error, isOut ? 'خطا در ثبت خروج انبار' : 'خطا در ثبت ورود انبار');
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>ثبت گردش انبار</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFSelect name="type" label="نوع گردش *">
              <MenuItem value={StockLedgerType.IN}>ورود</MenuItem>
              <MenuItem value={StockLedgerType.OUT}>خروج</MenuItem>
            </RHFSelect>

            <RHFSelect name="rawMaterialId" label="ماده تولید بتن *" disabled={!!rawMaterialId}>
              {rawMaterials.map((material) => (
                <MenuItem key={material.id} value={material.id}>
                  {material.name} — {material.category?.name ?? 'بدون دسته'}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFNumberInput name="quantity" captionText="مقدار (عدد صحیح) *" min={1} step={1} />

            {!isOut && (
              <RHFNumberInput
                name="unitPrice"
                captionText="قیمت خرید واحد (ریال) *"
                min={0}
                step={1000}
              />
            )}

            <RHFDateTimePicker name="occurredAt" label="تاریخ و زمان *" />

            <RHFTextField
              name="party"
              label={isOut ? 'مصرف‌کننده / مقصد' : 'طرف حساب / تأمین‌کننده'}
            />

            <RHFTextField name="note" label="توضیحات" multiline rows={3} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? 'در حال ثبت...' : isOut ? 'ثبت خروج' : 'ثبت ورود'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
