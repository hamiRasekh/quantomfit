'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { attributeValuesApi } from '../api/attributeValuesApi';
import { AttributeValue, CreateAttributeValueDto, UpdateAttributeValueDto } from '../types';

const Schema = z.object({
  value: z.string().min(1, 'مقدار الزامی است'),
  isActive: z.boolean().optional(),
});

type FormValues = z.infer<typeof Schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  attributeId: string;
  valueItem?: AttributeValue | null;
  onSuccess: () => void;
};

export function AttributeValueFormDialog({ open, onClose, attributeId, valueItem, onSuccess }: Props) {
  const isEdit = !!valueItem;

  const methods = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      value: '',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (!open) return;
    if (valueItem) {
      reset({ value: valueItem.value, isActive: valueItem.isActive });
    } else {
      reset({ value: '', isActive: true });
    }
  }, [open, valueItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && valueItem) {
        const updateData: UpdateAttributeValueDto = {
          value: data.value,
          isActive: data.isActive,
        };
        await attributeValuesApi.update(valueItem.id, updateData);
        toast.success('مقدار با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateAttributeValueDto = {
          value: data.value,
          isActive: data.isActive ?? true,
        };
        await attributeValuesApi.createForAttribute(attributeId, createData);
        toast.success('مقدار با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>{isEdit ? 'ویرایش مقدار' : 'مقدار جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="value" label="مقدار" required />
            <RHFCheckbox name="isActive" label="فعال" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

